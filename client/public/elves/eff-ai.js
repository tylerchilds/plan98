import { Self } from '@plan98/types'

const $ = Self('eff-ai')

$.style(`
  & {
    width: 100%;
    height: 100%;
    display: block;
    background: rgba(128,128,128,.5);
    --red: rgba(178, 34, 34, 0.5);   /* firebrick */
    --orange: rgba(255, 140, 0, 0.5);   /* darkorange */
    --yellow: rgba(255, 215, 0, 0.5);   /* gold */
    --green: rgba(60, 179, 113, 0.5);  /* mediumseagreen */
    --blue: rgba(30, 144, 255, 0.5);  /* dodgerblue */
    --purple: rgba(147, 112, 219, 0.5); /* mediumpurple */
    mix-blend-mode: multiply;
  }

  &.red {
    background:
      linear-gradient(160deg, rgba(0,0,0,.9) 10%, var(--red), transparent),
      linear-gradient(45deg, rgba(0,0,0,.9) 30%, var(--red), transparent)
    ;
  }

  &.orange {
    background:
      linear-gradient(160deg, rgba(0,0,0,.9) 10%, var(--orange), transparent),
      linear-gradient(45deg, rgba(0,0,0,.9) 30%, var(--orange), transparent)
    ;
  }

  &.yellow {
    background:
      linear-gradient(160deg, rgba(0,0,0,.9) 10%, var(--yellow), transparent),
      linear-gradient(45deg, rgba(0,0,0,.9) 30%, var(--yellow), transparent)
    ;
  }

  &.green {
    background:
      linear-gradient(160deg, rgba(0,0,0,.9) 10%, var(--green), transparent),
      linear-gradient(45deg, rgba(0,0,0,.9) 30%, var(--green), transparent)
    ;
  }

  &.blue {
    background:
      linear-gradient(160deg, rgba(0,0,0,.9) 10%, var(--blue), transparent),
      linear-gradient(45deg, rgba(0,0,0,.9) 30%, var(--blue), transparent)
    ;
  }

  &.violet {
    background:
      linear-gradient(160deg, rgba(0,0,0,.9) 10%, var(--violet), transparent),
      linear-gradient(45deg, rgba(0,0,0,.9) 30%, var(--violet), transparent)
    ;
  }
`)
