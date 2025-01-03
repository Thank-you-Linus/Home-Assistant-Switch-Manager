import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { createCloseHeading } from "../../ha-frontend/components/ha-dialog";
import { haStyle, haStyleDialog } from "../../ha-frontend/resources/styles"
import { fireEvent } from "../../ha-frontend/common/dom/fire_event";
import "@material/mwc-button";
import "../../ha-frontend/components/ha-textfield";

declare global {
    interface HTMLElementTagNameMap {
        "switch-manager-dialog-rename-switch": SwitchManagerDialogRenameSwitch;
    }
}

@customElement('switch-manager-dialog-rename-switch')
class SwitchManagerDialogRenameSwitch extends LitElement
{
    @property({ attribute: false }) public hass!: any;

    @state() private _opened = false;

    @state() private _error?: string;

    private _params!: any;

    private _newName?: string;
    private _newArea?: string;

    public showDialog(params: any): void
    {
        this._opened = true;
        this._error = undefined;
        this._params = params;
        this._newName = params.config.name;
        this._newArea = params.config.area;
    }

    public closeDialog(): void
    {
        this._params.onClose();

        if (this._opened) {
            fireEvent(this, "dialog-closed", { dialog: this.localName });
        }
        this._opened = false;
    }

    protected render(): TemplateResult
    {
        if (!this._opened) {
            return html``;
        }
        return html`
            <ha-dialog
                open
                scrimClickAction
                @closed=${this.closeDialog}
                .heading="${createCloseHeading(this.hass, 'Add a new switch')}">
                ${this._error ? html`<ha-alert alert-type="error">Missing Name</ha-alert>` : ""}

                <h3 class="name">Change the switch name :</h3>

                <ha-textfield
                    dialogInitialFocus
                    .value=${this._newName}
                    .placeholder=Name
                    .label=Name
                    required
                    type="string"
                    @input=${this._valueChanged}></ha-textfield>

                <h3 class="name">Select an area :</h3>

                <ha-area-picker
                    .hass=${this.hass}
                    .name=${"area"}
                    .value=${this._newArea}
                    @value-changed=${this._areaChanged}
                  >
                  </ha-area-picker>

                <mwc-button @click=${this.closeDialog} slot="secondaryAction">
                    Cancel
                </mwc-button>
                <mwc-button @click=${this._save} slot="primaryAction">
                    Save
                </mwc-button>
            </ha-dialog>
        `;
    }

    static get styles(): CSSResultGroup {
        return [
          haStyle,
          haStyleDialog,
          css`
            ha-textfield,
            ha-textarea {
              display: block;
            }
            ha-alert {
              display: block;
              margin-bottom: 16px;
            }
          `,
        ];
    }

    private _valueChanged(ev: CustomEvent)
    {
        ev.stopPropagation();
        const target = ev.target as any;
        this._newName = target.value;
    }

    private _areaChanged(ev: CustomEvent)
    {
        ev.stopPropagation();
        const target = ev.target as any;
        this._newArea = target.value;
    }

    private _save()
    {
        if (!this._newName) {
            this._error = "Name is required";
            return;
        }
        this._params.update({
            ...this._params.config,
            name: this._newName,
            area: this._newArea
        });
        this.closeDialog();
    }
}