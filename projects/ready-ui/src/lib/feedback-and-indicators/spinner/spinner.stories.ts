import { storiesOf, moduleMetadata } from '@storybook/angular';
import { select, text, boolean } from '@storybook/addon-knobs';
import { SpinnerModule } from '@ready-education/ready-ui';

const sizes = {
  Regular: 'regular',
  Small: 'small'
};

storiesOf('Spinner', module)
  .addDecorator(
    moduleMetadata({
      imports: [SpinnerModule]
    })
  )
  .add(
    'Spinner',
    () => {
      return {
        props: {
          centered: boolean('Centered', true),
          size: select('Size', sizes, 'regular'),
          color: text('Background Color', '#2c94e9')
        },
        template: `
          <ready-ui-spinner
            [size]="size"
            [color]="color"
            [centered]="centered"></ready-ui-spinner>`
      };
    },
    {
      notes: require('./spinner/README.md')
    }
  );
