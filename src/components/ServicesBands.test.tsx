import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import ServicesBands from './ServicesBands';

afterEach(cleanup);

describe('ServicesBands', () => {
  it('keeps the rendered markup', async () => {
    const { container } = render(await ServicesBands());
    expect(container.innerHTML).toMatchSnapshot();
  });
});
