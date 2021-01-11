import A11yDialog, { getSiblings } from "./A11yDialog";
// import { printInfo } from "./debugUtils";

export class A11yDialogOuterBtn extends A11yDialog {
  private timestamp = 0;
  private deep = 0;
  private tree: HTMLElement[] = [];

  constructor(dialogElm: HTMLElement, btnClose: HTMLButtonElement, private openLabel = "", private closeLabel = "") {
    super(dialogElm, btnClose);
  }

  private getBtnParent(siblings: HTMLElement[]) {
    let deep = 0;
    let tree = [];
    let parentElm: HTMLElement | undefined = undefined;

    while (!siblings.some(elm => elm === parentElm)) {
      if (parentElm === undefined) {
        parentElm = this.btnClose;
      } else {
        parentElm = parentElm.parentElement as HTMLElement;
      }

      if (parentElm === document.body) {
        // printInfo("A11yDialogOuterBtn.getBtnParent() -> while -> break; parentElm === body");
        break;
      }

      deep++;
      tree.push(parentElm);
    }

    this.deep = deep;
    this.tree = tree;

    // printInfo("A11yDialogOuterBtn.deep", this.deep);
    // printInfo("A11yDialogOuterBtn.tree", this.tree);
  }

  /**
   * Находим элементы, которые нужно скрывать (inert и aria-hidden).
   * Это соседи кнопки и соседи родителей, вплоть то главного родителя (который сосед модалки)
   */
  private getBtnSiblings() {
    const elms = [...this.tree.slice(0, this.deep - 1)];
    // printInfo("A11yDialogOuterBtn.getBtnSiblings() -> elms:", elms);
    let siblings: HTMLElement[] = [];

    elms.forEach(elm => {
      const elmSiblings = getSiblings(elm);
      siblings = [...siblings, ...elmSiblings];
    });

    // printInfo("A11yDialogOuterBtn.getBtnSiblings() -> siblings:", siblings);

    return siblings;
  }

  protected getSiblings() {
    const siblings = super.getSiblings();
    this.getBtnParent(siblings);
    const filteredSiblings = siblings.filter(sibling => sibling !== this.tree[this.deep - 1]);

    // printInfo("A11yDialogOuterBtn.getSiblings()", [...filteredSiblings, ...this.getBtnSiblings()]);

    return [...filteredSiblings, ...this.getBtnSiblings()];
  }

  private allowClick(): boolean {
    return Date.now() - this.timestamp >= 50;
  }

  show() {
    if (!this.isOpen && this.allowClick()) {
      super.show();
      this.btnClose.setAttribute('aria-label', this.closeLabel);
      this.timestamp = Date.now();
    }

  }

  hide() {
    if (this.isOpen && this.allowClick()) {
      super.hide();
      this.btnClose.setAttribute('aria-label', this.openLabel);
      this.timestamp = Date.now();
    }
  }

  protected handleBackwardTab(event: KeyboardEvent) {
    if (document.activeElement === this.firstFocusableElm) {
      event.preventDefault();
      this.btnClose.focus();
      console.log("focus to btnClose");
    } else if (document.activeElement === this.btnClose) {
      event.preventDefault();
      this.lastFocusableElm.focus();
      console.log("focus to last");
    }
  }

  protected handleForwardTab(event: KeyboardEvent) {
    if (document.activeElement === this.lastFocusableElm) {
      event.preventDefault();
      this.btnClose.focus();
      console.log("focus to btnClose");
    } else if (document.activeElement === this.btnClose) {
      event.preventDefault();
      this.firstFocusableElm.focus();
      console.log("focus to first");
    }
  }

  protected addEvents() {
    super.addEvents();
    this.btnClose.addEventListener("keydown", this.handleKeyDown.bind(this));
  }
}
