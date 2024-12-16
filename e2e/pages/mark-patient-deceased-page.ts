import { expect, type Page } from '@playwright/test';  // Importing expect

export class MarkPatientDeceasedPage {
  constructor(private readonly page: Page) {}

  readonly actionsButton = () => this.page.getByRole('button', { name: /actions/i });
  readonly markDeceasedMenuItem = () => this.page.getByRole('menuitem', { name: /mark patient deceased/i });
  readonly deathDetailsForm = () => this.page.locator('form');
  readonly dateOfDeathInput = () => this.page.getByPlaceholder(/dd\/mm\/yyyy/i);
  readonly causeOfDeathRadio = (cause: string) => this.page.getByRole('radio', { name: cause });
  readonly saveAndCloseButton = () => this.page.getByRole('button', { name: /save and close/i });
  readonly deceasedTag = () => this.page.locator('div:has-text("Deceased")');  // Adjust if needed


  async goToPatientChart(patientUuid: string) {
    await this.page.goto(`/openmrs/spa/patient/${patientUuid}/chart/Patient%20Summary`);
  }

  async openMarkDeceasedForm() {
    await this.actionsButton().click();
    await this.markDeceasedMenuItem().click();
  }

  async fillDeathDetails(date: string, causeOfDeath: string) {
    await this.dateOfDeathInput().fill(date);
    await this.causeOfDeathRadio(causeOfDeath).click();
  }

  async saveAndClose() {
    await this.saveAndCloseButton().click();
  }

  async verifyDeceasedTag() {
    await this.page.waitForSelector('div:has-text("Deceased")', { state: 'visible' });  // Ensure "Deceased" is visible
    await expect(this.deceasedTag()).toBeVisible();  // Verifying the "Deceased" label
  }
}
