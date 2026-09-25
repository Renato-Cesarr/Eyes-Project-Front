import AxeBuilder from '@axe-core/playwright';
import { expect, Page } from '@playwright/test';

export async function expectNoSeriousAccessibilityViolations(page: Page): Promise<void> {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();

  const seriousViolations = results.violations.filter(
    ({ impact }) => impact === 'critical' || impact === 'serious',
  );

  expect(seriousViolations, formatViolations(seriousViolations)).toEqual([]);
}

function formatViolations(
  violations: ReadonlyArray<{
    id: string;
    help: string;
    nodes: ReadonlyArray<{ target: unknown }>;
  }>,
): string {
  return violations
    .map(
      ({ id, help, nodes }) => `${id}: ${help} (${nodes.map(({ target }) => target).join(', ')})`,
    )
    .join('\n');
}
