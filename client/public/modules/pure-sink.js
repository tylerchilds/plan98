import module from '@silly/tag'

const $ = module('pure-sink')

$.draw(() => `
  <div>
    <div class="pure-menu pure-menu-horizontal">
    <ul class="pure-menu-list">
        <li class="pure-menu-item pure-menu-selected">
            <a href="#" class="pure-menu-link">Home</a>
        </li>
        <li class="pure-menu-item pure-menu-has-children pure-menu-allow-hover">
            <a href="#" id="menuLink1" class="pure-menu-link">Contact</a>
            <ul class="pure-menu-children">
                <li class="pure-menu-item">
                    <a href="#" class="pure-menu-link">Email</a>
                </li>
                <li class="pure-menu-item">
                    <a href="#" class="pure-menu-link">Twitter</a>
                </li>
                <li class="pure-menu-item">
                    <a href="#" class="pure-menu-link">Tumblr Blog</a>
                </li>
            </ul>
        </li>
      </ul>
    </div>
    <div class="pure-menu custom-restricted-width">
    <ul class="pure-menu-list">
        <li class="pure-menu-item pure-menu-selected">
            <a href="#" class="pure-menu-link">Flickr</a>
        </li>
        <li class="pure-menu-item">
            <a href="#" class="pure-menu-link">Messenger</a>
        </li>
        <li class="pure-menu-item">
            <a href="#" class="pure-menu-link">Sports</a>
        </li>
        <li class="pure-menu-item">
            <a href="#" class="pure-menu-link">Finance</a>
        </li>
        <li class="pure-menu-item pure-menu-has-children">
            <a href="#" id="menuLink1" class="pure-menu-link">More</a>
            <ul class="pure-menu-children">
                <li class="pure-menu-item">
                    <a href="#" class="pure-menu-link">Autos</a>
                </li>
                <li class="pure-menu-item">
                    <a href="#" class="pure-menu-link">Flickr</a>
                </li>
                <li class="pure-menu-item pure-menu-has-children">
                    <a href="#" id="menuLink1" class="pure-menu-link">Even More</a>
                    <ul class="pure-menu-children">
                        <li class="pure-menu-item">
                            <a href="#" class="pure-menu-link">Foo</a>
                        </li>
                        <li class="pure-menu-item">
                            <a href="#" class="pure-menu-link">Bar</a>
                        </li>
                        <li class="pure-menu-item">
                            <a href="#" class="pure-menu-link">Baz</a>
                        </li>
                    </ul>
                </li>
            </ul>
        </li>
        </ul>
    </div>
    <style>
        .button-success,
        .button-error,
        .button-warning,
        .button-secondary {
            color: white;
            border-radius: 4px;
            text-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
        }

        .button-success {
            background: rgb(28, 184, 65);
            /* this is a green */
        }

        .button-error {
            background: rgb(202, 60, 60);
            /* this is a maroon */
        }

        .button-warning {
            background: rgb(223, 117, 20);
            /* this is an orange */
        }

        .button-secondary {
            background: rgb(66, 184, 221);
            /* this is a light blue */
        }
    </style>
    <button class="button-success pure-button">Success Button</button>
    <button class="button-error pure-button">Error Button</button>
    <button class="button-warning pure-button">Warning Button</button>
    <button class="button-secondary pure-button">Secondary Button</button>
  </div> 
  <form class="pure-form pure-form-aligned">
    <fieldset>
        <div class="pure-control-group">
            <label for="aligned-name">Username</label>
            <input type="text" id="aligned-name" placeholder="Username" />
            <span class="pure-form-message-inline">This is a required field.</span>
        </div>
        <div class="pure-control-group">
            <label for="aligned-password">Password</label>
            <input type="password" id="aligned-password" placeholder="Password" />
        </div>
        <div class="pure-control-group">
            <label for="aligned-email">Email Address</label>
            <input type="email" id="aligned-email" placeholder="Email Address" />
        </div>
        <div class="pure-control-group">
            <label for="aligned-foo">Supercalifragilistic Label</label>
            <input type="text" id="aligned-foo" placeholder="Enter something here..." />
        </div>
        <div class="pure-controls">
            <label for="aligned-cb" class="pure-checkbox">
                <input type="checkbox" id="aligned-cb" /> I&#x27;ve read the terms and conditions
            </label>
            <button type="submit" class="pure-button pure-button-primary">Submit</button>
        </div>
    </fieldset>
  </form>

  <form class="pure-form pure-form-stacked">
    <fieldset>
        <legend>Legend</legend>
        <div class="pure-g">
            <div class="pure-u-1 pure-u-md-1-3">
                <label for="multi-first-name">First Name</label>
                <input type="text" id="multi-first-name" class="pure-u-23-24" />
            </div>
            <div class="pure-u-1 pure-u-md-1-3">
                <label for="multi-last-name">Last Name</label>
                <input type="text" id="multi-last-name" class="pure-u-23-24" />
            </div>
            <div class="pure-u-1 pure-u-md-1-3">
                <label for="multi-email">E-Mail</label>
                <input type="email" id="multi-email" class="pure-u-23-24" required="" />
            </div>
            <div class="pure-u-1 pure-u-md-1-3">
                <label for="multi-city">City</label>
                <input type="text" id="multi-city" class="pure-u-23-24" />
            </div>
            <div class="pure-u-1 pure-u-md-1-3">
                <label for="multi-state">State</label>
                <select id="multi-state" class="pure-input-1-2">
                    <option>AL</option>
                    <option>CA</option>
                    <option>IL</option>
                </select>
            </div>
        </div>
        <label for="multi-terms" class="pure-checkbox">
            <input type="checkbox" id="multi-terms" /> I&#x27;ve read the terms and conditions
        </label>
        <button type="submit" class="pure-button pure-button-primary">Submit</button>
    </fieldset>
  </form>

  <form class="pure-form">
    <label for="checkbox-radio-option-one" class="pure-checkbox">
        <input type="checkbox" id="checkbox-radio-option-one" value="" /> Here&#x27;s option one.
    </label>
    <label for="checkbox-radio-option-two" class="pure-radio">
        <input type="radio" id="checkbox-radio-option-two" name="optionsRadios" value="option1" checked="" /> Here&#x27;s a radio button. You can choose this one..
    </label>
    <label for="checkbox-radio-option-three" class="pure-radio">
        <input type="radio" id="checkbox-radio-option-three" name="optionsRadios" value="option2" /> ..Or this one!
    </label>
  </form>

  <form class="pure-form pure-g">
    <div class="pure-u-1-4">
        <input type="text" class="pure-input-1" placeholder=".pure-u-1-4" />
    </div>
    <div class="pure-u-3-4">
        <input type="text" class="pure-input-1" placeholder=".pure-u-3-4" />
    </div>
    <div class="pure-u-1-2">
        <input type="text" class="pure-input-1" placeholder=".pure-u-1-2" />
    </div>
    <div class="pure-u-1-2">
        <input type="text" class="pure-input-1" placeholder=".pure-u-1-2" />
    </div>
    <div class="pure-u-1-8">
        <input type="text" class="pure-input-1" placeholder=".pure-u-1-8" />
    </div>
    <div class="pure-u-1-8">
        <input type="text" class="pure-input-1" placeholder=".pure-u-1-8" />
    </div>
    <div class="pure-u-1-4">
        <input type="text" class="pure-input-1" placeholder=".pure-u-1-4" />
    </div>
    <div class="pure-u-1-2">
        <input type="text" class="pure-input-1" placeholder=".pure-u-1-2" />
    </div>
    <div class="pure-u-1-5">
        <input type="text" class="pure-input-1" placeholder=".pure-u-1-5" />
    </div>
    <div class="pure-u-2-5">
        <input type="text" class="pure-input-1" placeholder=".pure-u-2-5" />
    </div>
    <div class="pure-u-2-5">
        <input type="text" class="pure-input-1" placeholder=".pure-u-2-5" />
    </div>
    <div class="pure-u-1">
        <input type="text" class="pure-input-1" placeholder=".pure-u-1" />
    </div>
  </form>
`)
