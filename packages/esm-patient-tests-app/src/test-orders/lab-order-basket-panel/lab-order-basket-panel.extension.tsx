import React, { type ComponentProps, useCallback, useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Button, Tile } from '@carbon/react';
import {
  AddIcon,
  closeWorkspace,
  ChevronDownIcon,
  ChevronUpIcon,
  useLayoutType,
  useConfig,
} from '@openmrs/esm-framework';
import {
  launchPatientWorkspace,
  type OrderBasketItem,
  useOrderBasket,
  type TestOrderBasketItem,
  useOrderType,
} from '@openmrs/esm-patient-common-lib';
import { LabOrderBasketItemTile } from './lab-order-basket-item-tile.component';
import { prepLabOrderPostData } from '../api';
import LabIcon from './lab-icon.component';
import styles from './lab-order-basket-panel.scss';
import type { ConfigObject } from '../../config-schema';

/**
 * Designs: https://app.zeplin.io/project/60d59321e8100b0324762e05/screen/648c44d9d4052c613e7f23da
 */
export default function LabOrderBasketPanelExtension() {
  const { orders, additionalOrderTypes } = useConfig<ConfigObject>();
  const allOrderTypes: ConfigObject['additionalOrderTypes'] = [
    {
      orderTypeUuid: orders.labOrderTypeUuid,
      orderableConceptClasses: orders.labOrderConceptClasses,
      orderableConceptSets: orders.labOrderableConcepts,
    },
    ...additionalOrderTypes,
  ];

  return (
    <>
      {allOrderTypes.map((orderTypeConfig) => (
        <LabOrderBasketPanel {...orderTypeConfig} />
      ))}
    </>
  );
}

type OrderTypeConfig = ConfigObject['additionalOrderTypes'][0];

interface LabOrderBasketPanelProps extends OrderTypeConfig {}

function LabOrderBasketPanel({ orderTypeUuid }: LabOrderBasketPanelProps) {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const { orderType, isLoadingOrderType } = useOrderType(orderTypeUuid);

  const { orders, setOrders } = useOrderBasket<TestOrderBasketItem>(orderTypeUuid, prepLabOrderPostData);
  const [isExpanded, setIsExpanded] = useState(orders.length > 0);
  const {
    incompleteOrderBasketItems,
    newOrderBasketItems,
    renewedOrderBasketItems,
    revisedOrderBasketItems,
    discontinuedOrderBasketItems,
  } = useMemo(() => {
    const incompleteOrderBasketItems: Array<TestOrderBasketItem> = [];
    const newOrderBasketItems: Array<TestOrderBasketItem> = [];
    const renewedOrderBasketItems: Array<TestOrderBasketItem> = [];
    const revisedOrderBasketItems: Array<TestOrderBasketItem> = [];
    const discontinuedOrderBasketItems: Array<TestOrderBasketItem> = [];

    orders.forEach((order) => {
      if (order?.isOrderIncomplete) {
        incompleteOrderBasketItems.push(order);
      } else if (order.action === 'NEW') {
        newOrderBasketItems.push(order);
      } else if (order.action === 'RENEW') {
        renewedOrderBasketItems.push(order);
      } else if (order.action === 'REVISE') {
        revisedOrderBasketItems.push(order);
      } else if (order.action === 'DISCONTINUE') {
        discontinuedOrderBasketItems.push(order);
      }
    });

    return {
      incompleteOrderBasketItems,
      newOrderBasketItems,
      renewedOrderBasketItems,
      revisedOrderBasketItems,
      discontinuedOrderBasketItems,
    };
  }, [orders]);

  const openNewLabForm = useCallback(() => {
    closeWorkspace('order-basket', {
      ignoreChanges: true,
      onWorkspaceClose: () =>
        launchPatientWorkspace('add-lab-order', {
          orderTypeUuid: orderTypeUuid,
        }),
    });
  }, [orderTypeUuid]);

  const openEditLabForm = useCallback(
    (order: OrderBasketItem) => {
      closeWorkspace('order-basket', {
        ignoreChanges: true,
        onWorkspaceClose: () =>
          launchPatientWorkspace('add-lab-order', {
            order,
            orderTypeUuid: orderTypeUuid,
          }),
      });
    },
    [orderTypeUuid],
  );

  const removeLabOrder = useCallback(
    (order: TestOrderBasketItem) => {
      const newOrders = [...orders];
      newOrders.splice(orders.indexOf(order), 1);
      setOrders(newOrders);
    },
    [orders, setOrders],
  );

  useEffect(() => {
    setIsExpanded(orders.length > 0);
  }, [orders]);

  if (isLoadingOrderType || orderType.javaClassName !== 'org.openmrs.TestOrder') {
    return null;
  }

  return (
    <Tile
      className={classNames(isTablet ? styles.tabletTile : styles.desktopTile, { [styles.collapsedTile]: !isExpanded })}
    >
      <div className={styles.container}>
        <div className={styles.iconAndLabel}>
          <LabIcon isTablet={isTablet} />
          <h4 className={styles.heading}>{`${orderType?.display} (${orders.length})`}</h4>
        </div>
        <div className={styles.buttonContainer}>
          <Button
            className={styles.addButton}
            iconDescription="Add lab order"
            kind="ghost"
            onClick={openNewLabForm}
            renderIcon={(props: ComponentProps<typeof AddIcon>) => <AddIcon size={16} {...props} />}
            size={isTablet ? 'md' : 'sm'}
          >
            {t('add', 'Add')}
          </Button>
          <Button
            className={styles.chevron}
            disabled={orders.length === 0}
            hasIconOnly
            iconDescription="View"
            kind="ghost"
            onClick={() => setIsExpanded(!isExpanded)}
            renderIcon={(props: ComponentProps<typeof ChevronUpIcon>) =>
              isExpanded ? <ChevronUpIcon size={16} {...props} /> : <ChevronDownIcon size={16} {...props} />
            }
          >
            {t('add', 'Add')}
          </Button>
        </div>
      </div>
      {isExpanded && (
        <>
          {orders.length > 0 && (
            <>
              {incompleteOrderBasketItems.length > 0 && (
                <>
                  {incompleteOrderBasketItems.map((order) => (
                    <LabOrderBasketItemTile
                      key={order.uuid}
                      onItemClick={() => openEditLabForm(order)}
                      onRemoveClick={() => removeLabOrder(order)}
                      orderBasketItem={order}
                    />
                  ))}
                </>
              )}
              {newOrderBasketItems.length > 0 && (
                <>
                  {newOrderBasketItems.map((order) => (
                    <LabOrderBasketItemTile
                      key={order.uuid}
                      onItemClick={() => openEditLabForm(order)}
                      onRemoveClick={() => removeLabOrder(order)}
                      orderBasketItem={order}
                    />
                  ))}
                </>
              )}

              {renewedOrderBasketItems.length > 0 && (
                <>
                  {renewedOrderBasketItems.map((order) => (
                    <LabOrderBasketItemTile
                      key={order.uuid}
                      onItemClick={() => openEditLabForm(order)}
                      onRemoveClick={() => removeLabOrder(order)}
                      orderBasketItem={order}
                    />
                  ))}
                </>
              )}

              {revisedOrderBasketItems.length > 0 && (
                <>
                  {revisedOrderBasketItems.map((order) => (
                    <LabOrderBasketItemTile
                      key={order.uuid}
                      onItemClick={() => openEditLabForm(order)}
                      onRemoveClick={() => removeLabOrder(order)}
                      orderBasketItem={order}
                    />
                  ))}
                </>
              )}

              {discontinuedOrderBasketItems.length > 0 && (
                <>
                  {discontinuedOrderBasketItems.map((order) => (
                    <LabOrderBasketItemTile
                      key={order.uuid}
                      onItemClick={() => openEditLabForm(order)}
                      onRemoveClick={() => removeLabOrder(order)}
                      orderBasketItem={order}
                    />
                  ))}
                </>
              )}
            </>
          )}
        </>
      )}
    </Tile>
  );
}
