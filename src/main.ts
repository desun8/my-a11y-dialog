import { A11yDialogOuterBtn } from "./A11yDialogOuterBtn";
import A11yDialogInner from "./A11yDialog";
import { printInfo } from "./debugUtils";

class A11yDialog {
  private readonly dialog: A11yDialogInner | A11yDialogOuterBtn;
  show: () => void;

  constructor(private container: HTMLElement, private btnClose: HTMLButtonElement, private openLabel = "", private closeLabel = "") {
    const isBtnCloseInside = this.btnClose.closest(`#${this.container.id}`);
    printInfo('isBtnCloseInside', isBtnCloseInside)
    printInfo('this.btnClose', this.btnClose)
    printInfo('this.container.id', this.container.id)

    if (isBtnCloseInside) {
      this.dialog = new A11yDialogInner(this.container, this.btnClose);
    } else {
      this.dialog = new A11yDialogOuterBtn(this.container, this.btnClose, this.openLabel, this.closeLabel)
    }

    this.show = this.dialog.show.bind(this.dialog);
  }
}

export default A11yDialog;
