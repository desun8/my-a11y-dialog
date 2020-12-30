// import "wicg-inert";

const FOCUSABLE_ELEMENTS: readonly string[] = [
  'a[href]:not([tabindex^="-"]):not([inert])',
  'area[href]:not([tabindex^="-"]):not([inert])',
  "input:not([disabled]):not([inert])",
  "select:not([disabled]):not([inert])",
  "textarea:not([disabled]):not([inert])",
  "button:not([disabled]):not([inert])",
  'iframe:not([tabindex^="-"]):not([inert])',
  'audio:not([tabindex^="-"]):not([inert])',
  'video:not([tabindex^="-"]):not([inert])',
  '[contenteditable]:not([tabindex^="-"]):not([inert])',
  '[tabindex]:not([tabindex^="-"]):not([inert])',
];

interface HTMLElementInert extends HTMLElement {
  inert?: boolean;
}

const setInert = (elm: HTMLElementInert, val: boolean) => {
  elm.inert = val;
};

const setAriaHidden = (elm: HTMLElement, val: boolean) => {
  elm.setAttribute("aria-hidden", `${val}`);
};

const getFocuseElm = () => document.activeElement as HTMLElement;
const setFocuseElm = (elm: HTMLElement) => elm.focus();

// const getSiblings = (el: HTMLElement) => [...el.parentNode.childNodes].filter(node => node !== el && node.tagName);

interface Dialog {
  // readonly dialog: HTMLElement;
  // readonly container: HTMLElement;
  // readonly focusableElms: HTMLElement[];
  // readonly firstFocusableElm: HTMLElement;
  // readonly lastFocusableElm: HTMLElement;
  // readonly siblings: HTMLElement[];
  // readonly btnClose: HTMLButtonElement;

  getSiblings(): HTMLElement[];
  setVisible(a: HTMLElement, b: boolean): void;
  setVisibleSiblings(a: boolean): void;
  show(): void;
  hide(): void;
}
class A11yDialog {
  private dialog: HTMLElement;
  private container: HTMLElement;
  private focusableElms: HTMLElement[];
  private firstFocusableElm: HTMLElement;
  private lastFocusableElm: HTMLElement;
  private siblings: HTMLElement[];
  private btnClose: HTMLButtonElement;
  private readonly isUseInert = false;
  private tempBeforeFocusedElm: HTMLElement | undefined = undefined;


  constructor(dialogElm: HTMLElement, btnClose: HTMLButtonElement) {
    this.dialog = dialogElm;
    this.container = this.dialog.querySelector(
      "[role='dialog'], [role='alertdialog']"
    ) as HTMLElement;

    this.focusableElms = Array.from(
      this.dialog.querySelectorAll(FOCUSABLE_ELEMENTS.join(","))
    );
    this.firstFocusableElm = this.focusableElms[0];
    this.lastFocusableElm = this.focusableElms[this.focusableElms.length - 1];

    this.siblings = this.getSiblings();
    this.btnClose = btnClose;

    // this.init();
    this.addEvents();
  }

  private getSiblings() {
    const siblings = [...this.dialog.parentElement!.children].filter(
      (elm) =>
        elm !== this.dialog &&
        elm.tagName !== "SCRIPT" &&
        elm.tagName !== "STYLE"
    ) as HTMLElement[];

    return siblings.filter((elm) => elm.getAttribute("aria-hidden") !== "true");
  }

  private setVisible(elm: HTMLElement, val: boolean) {
    if (this.isUseInert) {
      setInert(elm, val);
    }

    setAriaHidden(elm, val);
  }

  private setVisibleSiblings(val: boolean) {
    this.siblings.forEach((sibling) => this.setVisible(sibling, val));
  }

  /**
   * Возвращаем фокус на элемент, с которого был вызван диалог.
   */
  private restoreFocus() {
    if (this.tempBeforeFocusedElm) {
      setFocuseElm(this.tempBeforeFocusedElm);
      this.tempBeforeFocusedElm = undefined;
    }
  }

  show() {
    this.tempBeforeFocusedElm = getFocuseElm();

    this.container.setAttribute("open", "");
    this.setVisible(this.dialog, false);
    this.setVisible(this.btnClose, false);
    this.setVisibleSiblings(true);

    this.firstFocusableElm.focus();
  }

  hide() {
    this.restoreFocus();

    this.container.removeAttribute("open");
    this.setVisible(this.dialog, true);
    this.setVisibleSiblings(false);
  }

  private handleKeyDown(e: KeyboardEvent) {
    const Dialog = this;
    // const KEY_TAB = 9;
    // const KEY_ESC = 27;

    function handleBackwardTab() {
      if (document.activeElement === Dialog.firstFocusableElm) {
        e.preventDefault();
        Dialog.lastFocusableElm.focus();
      }
    }

    function handleForwardTab() {
      if (document.activeElement === Dialog.lastFocusableElm) {
        e.preventDefault();
        Dialog.firstFocusableElm.focus();
      }
    }

    switch (e.key) {
      case "Tab":
        if (Dialog.focusableElms.length === 1) {
          e.preventDefault();
          break;
        }
        if (e.shiftKey) {
          handleBackwardTab();
          console.log("focus move to prev element");
        } else {
          handleForwardTab();
          console.log("focus move to next element");
        }
        break;
      case "Escape":
        Dialog.hide();
        break;
      default:
        break;
    }
  }

  private addEvents() {
    this.dialog.addEventListener("keydown", this.handleKeyDown.bind(this));
    this.btnClose.addEventListener("click", this.hide.bind(this));
  }

  // init() {
  //   setInert(this.root, true);
  // }
}

// Если кнопка у нас в жопе мира
// Если кнопка "закрыть" находится вне элемента (мадалки/диалога)
// А где то внутри хедера, например.
// class A11yDialogOuterBtn extends A11yDialog {
//   constructor(...props) {
//     super(...props);
//     this.btnParentsDeep = 0;
//     this.btnParentsTree = [];
//   }

//   getBtnParent(siblings) {
//     try {
//       const btn = this.btnClose;
//       const parentsTree = [];
//       let deep = 0;
//       let parentElm = undefined;

//       while (!siblings.some(elm => elm === parentElm)) {
//         if (parentElm === undefined) {
//           parentElm = this.btnClose;
//         } else {
//           parentElm = parentElm.parentNode;
//         }

//         if (parentElm === document.body) {
//           throw new Error("Не удалось найти родительский элемент === модальному окну");
//         }

//         deep++;
//         parentsTree.push(parentElm);
//       }

//       this.btnParentsDeep = deep;
//       this.btnParentsTree = parentsTree;
//     } catch (e) {
//       console.warn("A11yDialogOuterBtn", e);
//     }

//   }

//   getBtnSiblings() {
//     // Находим элементы, которые нужно скрывать (inert и aria-hidden)
//     // Соседи кнопки и соседи родителей,
//     // вплоть то главного родителя (который сосед модалки)
//     const elms = [...this.btnParentsTree.slice(0, this.btnParentsDeep - 1), this.btnClose];
//     let newElms = [];

//     elms.forEach(elm => {
//       const siblings = getSiblings(elm);
//       newElms = [...newElms, ...siblings];
//     });

//     return newElms;
//   }

//   getSiblings() {
//     const siblings = super.getSiblings();

//     this.getBtnParent(siblings);

//     const filteredSiblings = siblings.filter(sibling => sibling !== this.btnParentsTree[this.btnParentsDeep - 1]);

//     // console.log("siblings -> ", [...filteredSiblings, ...this.getBtnSiblings()]);

//     return [...filteredSiblings, ...this.getBtnSiblings()];
//   }
// }

// export { A11yDialog, A11yDialogOuterBtn };

const dialogElm = document.querySelector("#dialog") as HTMLElement;
const btnCloseInner = document.querySelector(
  "#dialog .inner-btn-close"
) as HTMLButtonElement;
const dialog = new A11yDialog(dialogElm, btnCloseInner);
window.dialog = dialog;

(document.querySelector(".btn-dialog") as HTMLButtonElement).onclick = () =>
  dialog.show();
