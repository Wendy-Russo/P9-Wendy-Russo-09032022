/**
 * @jest-environment jsdom
 */

import {screen, wait, waitFor} from "@testing-library/dom";
import userEvent from '@testing-library/user-event'
import {localStorageMock} from "../__mocks__/localStorage.js";

import store from "../app/Store";
import mockStore from "../__mocks__/store.js";
import { ROUTES,ROUTES_PATH} from "../constants/routes.js";
import router from "../app/Router.js";

import BillsUI from "../views/BillsUI.js";
import Bills from "../containers/Bills.js";
import { bills } from "../fixtures/bills.js";

describe("Given I am connected as an employee", () => {
  describe('When I am on Bills page but it is loading', () => {
    test('Then, Loading page should be rendered', () => {

      document.body.innerHTML = BillsUI({ loading: true });
      expect(screen.getAllByText('Loading...')).toBeTruthy();

    })
  })
  describe('When I am on Bills page but back-end send an error message', () => {
    test('Then, Error page should be rendered', () => {

      document.body.innerHTML = BillsUI({ error: 'some error message' });
      expect(screen.getAllByText('Erreur')).toBeTruthy();

    })
  })
  describe('When I am on Bills page and there are no bills', () => {
    test('Then, no bill should be shown', () => {

      document.body.innerHTML = BillsUI({ });
      const iconEye = screen.queryByTestId('icon-eye');
      expect(iconEye).toBeNull();

    })
  })
  describe("when I am on Bills page and there is at least 1 bill", () => {

    let billObject;
    let onNavigate;

    beforeEach(() => {
      onNavigate = (pathname) => {document.body.innerHTML = ROUTES({ pathname })};

      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      window.localStorage.setItem('user', JSON.stringify({type: 'Employee'}));

      document.body.innerHTML = BillsUI({data:bills});

      billObject = new Bills({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage,
      });
    })

    describe('When I click on the icon eye', () => {
      test('A modal should open', () => {

        $.fn.modal = jest.fn();

        const eye = screen.getAllByTestId('icon-eye')[0];
        const modalTrigger = jest.fn(billObject.handleClickIconEye);
        eye.addEventListener('click', modalTrigger(eye));

        userEvent.click(eye);
        expect(modalTrigger).toHaveBeenCalled();

        const modale = document.getElementById("modaleFile");
        expect(modale).toBeTruthy();

        const modalTitle = document.getElementById("exampleModalLongTitle");
        expect(modalTitle).toBeTruthy();
      })
    })

    describe("When I click on New Bill button", () => {
      test("Then the new bill form page should be rendered", () => {

        onNavigate = jest.fn();

        const newBillButton = screen.getByTestId("btn-new-bill");
        const newBillTrigger = jest.fn(billObject.handleClickNewBill);

        newBillButton.addEventListener('click', newBillTrigger(newBillButton));
        userEvent.click(newBillButton);

        expect(newBillTrigger).toHaveBeenCalled();

        const formNewBill = screen.getByTestId("form-new-bill");
        expect(formNewBill).toBeTruthy();

      })
    })

    test("Then bill icon in vertical layout should be highlighted", async () => {

      expect(screen.getByTestId("icon-window").classList.contains("active-icon")).toBeTruthy;

    })

    test("Then bills should be ordered from earliest to latest", () => {

      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML);
      const antiChrono = (a, b) => ((a > b) ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);

    })
  })

  //test Get
  describe("When I navigate to Bills page", () => {

    let billObject;
    let onNavigate;

    beforeEach(() => {
      onNavigate = (pathname) => {document.body.innerHTML = ROUTES({ pathname })};

      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      window.localStorage.setItem('user', JSON.stringify({type: 'Employee'}));

      document.body.innerHTML = BillsUI({data:bills});

      billObject = new Bills({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage,
      });
    })

    test("fetches bills from mock API GET", async () => {

      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      expect(screen.getByTestId("tbody")).toBeTruthy();

      //this.store = true;

      //const getBills = billObject.getBills;
      //const mockGetBills = jest.fn(billObject.getBills);
      //console.log(mockGetBills);

      /*return billObject.getBills().then( data => {
        console.log(data);

      })*/

    })

    describe("When an error occurs on API", () => {
      const getRequest = jest
      .fn(mockStore.get)
      .mockImplementationOnce(() => Promise.reject(new Error('Erreur 404')))
      .mockImplementationOnce(() => Promise.reject(new Error('Erreur 500')))

      test("fetches bills from an API and fails with 404 message error", async () => {

        let response;
        try {
          response = await getRequest()
        } catch (err) {
          response = {error: err}
        }
        document.body.innerHTML = BillsUI(response)
        expect(screen.getByText(/Erreur 404/)).toBeTruthy()

      })

      test("fetches messages from an API and fails with 500 message error", async () => {

        let response;
        try {
          response = await getRequest()
        } catch (err) {
          response = {error: err}
        }
        document.body.innerHTML = BillsUI(response)
        expect(screen.getByText(/Erreur 500/)).toBeTruthy()
      })

    })
  })
})
