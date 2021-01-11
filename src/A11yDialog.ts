const FOCUSABLE_ELEMENTS: readonly string[] = [
  "a[href]:not([tabindex^=\"-\"]):not([inert])",
  "area[href]:not([tabindex^=\"-\"]):not([inert])",
  "input:not([disabled]):not([inert])",
  "select:not([disabled]):not([inert])",
  "textarea:not([disabled]):not([inert])",
  "button:not([disabled]):not([inert])",
  "iframe:not([tabindex^=\"-\"]):not([inert])",
  "audio:not([tabindex^=\"-\"]):not([inert])",
  "video:not([tabindex^=\"-\"]):not([inert])",
  "[contenteditable]:not([tabindex^=\"-\"]):not([inert])",
  "[tabindex]:not([tabindex^=\"-\"]):not([inert])",
];

const setAriaHidden = (elm: HTMLElement, val: boolean) => {
  elm.setAttribute("aria-hidden", `${val}`);
};
const getFocusElm = () => document.activeElement as HTMLElement;
const setFocusElm = (elm: HTMLElement) => elm.focus();
export const getSiblings = (el: HTMLElement) => {
  const children = [...el.parentElement!.children];
  return children.filter(elm =>
    elm !== el
    && elm.tagName !== "SCRIPT"
    && elm.tagName !== "STYLE") as HTMLElement[];
};

class A11yDialog {
  private dialog: HTMLElement;
  protected focusableElms: HTMLElement[];
  protected firstFocusableElm: HTMLElement;
  protected lastFocusableElm: HTMLElement;
  protected siblings: HTMLElement[];
  protected isOpen = false;
  private tempBeforeFocusedElm: HTMLElement | undefined = undefined;


  constructor(private readonly container: HTMLElement, protected btnClose: HTMLButtonElement) {
    this.dialog = this.container.querySelector("dialog, [role='dialog'], [role='alertdialog']") as HTMLElement;

    this.focusableElms = Array.from(
      this.container.querySelectorAll(FOCUSABLE_ELEMENTS.join(",")),
    );
    this.firstFocusableElm = this.focusableElms[0];
    this.lastFocusableElm = this.focusableElms[this.focusableElms.length - 1];

    this.siblings = this.getSiblings();

    this.addEvents();
  }

  protected getSiblings() {
    const siblings = getSiblings(this.container);
    return siblings.filter((elm) => elm.getAttribute("aria-hidden") !== "true");
  }

  private static setVisible(elm: HTMLElement, val: boolean) {
    setAriaHidden(elm, val);
  }

  private setVisibleSiblings(val: boolean) {
    this.siblings.forEach((sibling) => A11yDialog.setVisible(sibling, val));
  }

  /**
   * Возвращаем фокус на элемент, с которого был вызван диалог.
   */
  private restoreFocus() {
    if (this.tempBeforeFocusedElm) {
      setFocusElm(this.tempBeforeFocusedElm);
      this.tempBeforeFocusedElm = undefined;
    }
  }

  show() {
    if (this.isOpen) return;

    console.log("open");
    this.isOpen = true;
    this.tempBeforeFocusedElm = getFocusElm();

    this.dialog.setAttribute("open", "");
    A11yDialog.setVisible(this.container, false);
    A11yDialog.setVisible(this.btnClose, false);
    this.setVisibleSiblings(true);

    this.firstFocusableElm.focus();
  }

  hide() {
    if (!this.isOpen) return;

    console.log("close");
    this.isOpen = false;
    this.restoreFocus();

    this.dialog.removeAttribute("open");
    A11yDialog.setVisible(this.container, true);
    this.setVisibleSiblings(false);
  }

  protected handleBackwardTab(event: KeyboardEvent) {
    if (document.activeElement === this.firstFocusableElm) {
      event.preventDefault();
      this.lastFocusableElm.focus();
    }
  }

  protected handleForwardTab(event: KeyboardEvent) {
    if (document.activeElement === this.lastFocusableElm) {
      event.preventDefault();
      this.firstFocusableElm.focus();
    }
  }

  protected handleKeyDown(e: KeyboardEvent) {
    if (!this.isOpen) return;

    switch (e.key) {
      case "Tab":
        if (this.focusableElms.length === 1) {
          e.preventDefault();
          break;
        }
        if (e.shiftKey) {
          this.handleBackwardTab(e);
          console.log("focus move to prev element");
        } else {
          this.handleForwardTab(e);
          console.log("focus move to next element");
        }
        break;
      case "Escape":
        this.hide();
        break;
      default:
        break;
    }
  }

  protected addEvents() {
    this.container.addEventListener("keydown", this.handleKeyDown.bind(this));
    this.btnClose.addEventListener("click", this.hide.bind(this));
  }
}

export default A11yDialog;
