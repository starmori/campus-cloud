import { number, select, boolean } from '@storybook/addon-knobs';
import { storiesOf, moduleMetadata } from '@storybook/angular';
import { centered } from '@storybook/addon-centered/angular';
import { ReadyUiModule } from '@ready-education/ready-ui';

import readme from './popover/README.md';

const positions = {
  Left: 'left',
  Right: 'right'
};

storiesOf('Overlays/Popover', module)
  .addDecorator(
    moduleMetadata({
      imports: [ReadyUiModule]
    })
  )
  .addDecorator(centered)
  .add(
    'Popover',
    () => {
      return {
        props: {
          closeOnMenuItemClick: boolean('Close on menu item click', false),
          offset: number('Veritcal Offset', 10),
          position: select('Position', positions, 'right')
        },
        styles: [
          `
          button {
            display: block;
            margin-bottom: 10px;
          }

          button:last-child {
            margin-bottom: 0;
          }
        `
        ],
        template: `
        <ready-ui-popover>
          <button
            ui-button
            type="button"
            [position]="position"
            readyUiPopoverTrigger
            [uiPopoverYOffset]="offset"
          >Open</button>
          <div (click)="closeOnMenuItemClick ? undefined : $event.stopPropagation()">
            <button ui-button>Item 1</button>
            <button ui-button>Item 2</button>
            <button ui-button>Item 3</button>
          </div>
        </ready-ui-popover>`
      };
    },
    {
      notes: readme
    }
  );
