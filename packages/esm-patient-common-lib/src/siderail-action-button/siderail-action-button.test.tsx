import React from 'react';
import { screen, render, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useLayoutType } from '@openmrs/esm-framework';
import { SiderailActionButton } from './siderail-action-button.component';
import { Pen } from '@carbon/react/icons';
import { useWorkspaces } from '../workspaces';

const mockedUseLayoutType = useLayoutType as jest.Mock;

jest.mock('@carbon/react/icons', () => ({
  ...(jest.requireActual('@carbon/react/icons') as jest.Mock),
  Pen: jest.fn(({ size }) => <div data-testid="pen-icon">size: {size}</div>),
}));

jest.mock('@openmrs/esm-framework', () => {
  const originalModule = jest.requireActual('@openmrs/esm-framework');

  return {
    ...originalModule,
    useLayoutType: jest.fn(),
  };
});

jest.mock('../workspaces', () => {
  const originalModule = jest.requireActual('../workspaces');

  return {
    ...originalModule,
    useWorkspaces: jest.fn(),
  };
});

describe('SiderailActionButton', () => {
  beforeEach(cleanup);

  it('should display tablet view', async () => {
    const user = userEvent.setup();

    (useWorkspaces as jest.Mock).mockReturnValue({
      workspaces: [{ name: 'order-basket-workspace' }],
    });

    mockedUseLayoutType.mockReturnValue('tablet');

    const handler = jest.fn();

    render(
      <SiderailActionButton
        getIcon={(props) => <Pen {...props} />}
        label={'Visit note'}
        iconDescription={'Note'}
        handler={handler}
        workspaceMatcher={/visit-note/i}
      />,
    );

    expect(screen.getByTestId('pen-icon')).toBeInTheDocument();
    expect(screen.getByTestId('pen-icon').innerHTML).toBe('size: 16');

    const button = screen.getByRole('button', { name: /Visit note/i });
    expect(button).toBeInTheDocument();
    await waitFor(() => user.click(button));
    expect(handler).toBeCalled();

    expect(button).not.toHaveClass('active');
  });

  it('should display have active className if workspace is collapsed(not closed)', async () => {
    (useWorkspaces as jest.Mock).mockReturnValue({
      workspaces: [{ name: 'order-basket-workspace' }, { name: 'visit-note-form-workspace' }],
    });

    mockedUseLayoutType.mockReturnValue('tablet');

    const handler = jest.fn();

    render(
      <SiderailActionButton
        getIcon={(props) => <Pen {...props} />}
        label={'Visit note'}
        iconDescription={'Note'}
        handler={handler}
        workspaceMatcher={/visit-note/i}
      />,
    );

    const button = screen.getByRole('button', { name: /Visit note/i });
    expect(button).toBeInTheDocument();

    expect(button).toHaveClass('active');
    expect(button).not.toHaveClass('open');
  });

  it('should display have open and active className if workspace is open', async () => {
    (useWorkspaces as jest.Mock).mockReturnValue({
      workspaces: [{ name: 'visit-note-form-workspace' }, { name: 'order-basket-workspace' }],
    });

    mockedUseLayoutType.mockReturnValue('tablet');

    const handler = jest.fn();

    render(
      <SiderailActionButton
        getIcon={(props) => <Pen {...props} />}
        label={'Visit note'}
        iconDescription={'Note'}
        handler={handler}
        workspaceMatcher={/visit-note/i}
      />,
    );

    const button = screen.getByRole('button', { name: /Visit note/i });
    expect(button).toBeInTheDocument();

    expect(button).toHaveClass('active');
    expect(button).toHaveClass('open');
  });

  it('should display desktop view', async () => {
    const user = userEvent.setup();

    (useWorkspaces as jest.Mock).mockReturnValue({
      workspaces: [{ name: 'order-basket-workspace' }],
    });

    mockedUseLayoutType.mockReturnValue('small-desktop');

    const handler = jest.fn();

    render(
      <SiderailActionButton
        getIcon={(props) => <Pen {...props} />}
        label={'Visit note'}
        iconDescription={'Note'}
        handler={handler}
        workspaceMatcher={/visit-note/i}
      />,
    );

    expect(screen.getByTestId('pen-icon')).toBeInTheDocument();
    expect(screen.getByTestId('pen-icon').innerHTML).toBe('size: 20');

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    await waitFor(() => user.click(button));
    expect(handler).toBeCalled();

    expect(button).not.toHaveClass('active');
  });

  it('should display have active className if workspace is collapsed(not closed)', async () => {
    (useWorkspaces as jest.Mock).mockReturnValue({
      workspaces: [{ name: 'order-basket-workspace' }, { name: 'visit-note-form-workspace' }],
    });

    mockedUseLayoutType.mockReturnValue('small-desktop');

    const handler = jest.fn();

    render(
      <SiderailActionButton
        getIcon={(props) => <Pen {...props} />}
        label={'Visit note'}
        iconDescription={'Note'}
        handler={handler}
        workspaceMatcher={/visit-note/i}
      />,
    );

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();

    expect(button).toHaveClass('active');
    expect(button).not.toHaveClass('open');
  });

  it('should display have open and active className if workspace is open', async () => {
    (useWorkspaces as jest.Mock).mockReturnValue({
      workspaces: [{ name: 'visit-note-form-workspace' }, { name: 'order-basket-workspace' }],
    });

    mockedUseLayoutType.mockReturnValue('small-desktop');

    const handler = jest.fn();

    render(
      <SiderailActionButton
        getIcon={(props) => <Pen {...props} />}
        label={'Visit note'}
        iconDescription={'Note'}
        handler={handler}
        workspaceMatcher={/visit-note/i}
      />,
    );

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();

    expect(button).toHaveClass('active');
    expect(button).toHaveClass('open');
  });
});