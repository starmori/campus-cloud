import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { storiesOf, moduleMetadata } from '@storybook/angular';
import { centered } from '@storybook/addon-centered/angular';
import { ReadyUiModule } from '@ready-education/ready-ui';
import { text, boolean } from '@storybook/addon-knobs';

import readme from './checkbox/README.md';

storiesOf('Form/Checkbox', module)
  .addDecorator(
    moduleMetadata({
      imports: [ReadyUiModule, ReactiveFormsModule]
    })
  )
  .addDecorator(centered)
  .add(
    'Checkbox',
    () => {
      const label = text('Label', 'Active');
      const checked = boolean('Checked', false);
      const disabled = boolean('Disabled', false);

      const form = new FormBuilder().group({
        active: [{ value: checked, disabled: disabled }, Validators.required]
      });
      return {
        props: {
          form,
          label,
          checked,
          disabled,
          ariaLabelledBy: !label || label === '' ? 'ariaLabel' : undefined
        },
        template: `
      <div id="ariaLabel" style="display: none">Hidden Label</div>
        <form [formGroup]="form">
          <ready-ui-checkbox
            [label]="label"
            [checked]="checked"
            [ariaLabelledBy]="ariaLabelledBy"
            formControlName="active"></ready-ui-checkbox>
        </form>
      `
      };
    },
    {
      notes: readme
    }
  );
