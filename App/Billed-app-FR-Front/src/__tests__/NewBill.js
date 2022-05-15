/**
 * @jest-environment jsdom
 */

import { screen , fireEvent } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'
import BillsUI from "../views/BillsUI.js"
import NewBillUI from '../views/NewBillUI.js'
import NewBill from '../containers/NewBill.js'
import { localStorageMock } from '../__mocks__/localStorage'
import { ROUTES } from '../constants/routes'
import { bills } from '../fixtures/bills.js'
import store from '../__mocks__/store.js'


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then i should see the NewBill form", () => {
      document.body.innerHTML = NewBillUI();

      const form = screen.getByTestId("form-new-bill");
      expect(form).toBeTruthy();

      const inputExpenseType = screen.getByTestId("expense-type");
      expect(inputExpenseType).toBeTruthy();

      const inputExpenseName = screen.getByTestId("expense-name");
      expect(inputExpenseName).toBeTruthy();

      const inputDate = screen.getByTestId("datepicker");
      expect(inputDate).toBeTruthy();

      const inputAmount = screen.getByTestId("amount");
      expect(inputAmount).toBeTruthy();

      const inputVat = screen.getByTestId("vat");
      expect(inputVat).toBeTruthy();

      const inputPCT = screen.getByTestId("pct");
      expect(inputPCT).toBeTruthy();

      const inputCommentary = screen.getByTestId("commentary");
      expect(inputCommentary).toBeTruthy();

      const inputFile = screen.getByTestId("file");
      expect(inputFile).toBeTruthy();
    });

    let onNavigate;
    let NewBillObject;
    let inputFile;
    let submitBttn;

    beforeEach(() => {

      document.body.innerHTML = NewBillUI();
      onNavigate = (pathname) => { document.body.innerHTML = ROUTES({ pathname }) };
      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }));

      NewBillObject = new NewBill({
        document,
        onNavigate,
        firestore: false,
        localStorage: window.localStorage,
      });

      inputFile = screen.getByTestId("file");
      submitBttn = screen.getByTestId("btn-send-bill");
    });

    //HandleChangeFile
    describe("When i add a file in the input", () => {

      test("Then the file should be modified", () => {

        const handleChangeFile = jest.fn(NewBillObject.handleChangeFile);

        inputFile.addEventListener('change', handleChangeFile);
        fireEvent.change(inputFile, {
          target: {
            files: [new File(['image.jpg'], 'image.jpg', { type: 'image/jpg' })],
          },
        });

        expect(handleChangeFile).toHaveBeenCalled();
        expect(inputFile.files[0].name).toBe('image.jpg');

      });

      test("Then invalid files should be refused", () => {

        let fileError = document.querySelector(`[data-testid="file-error-message"]`);

        fireEvent.change(inputFile, {
          target: {
            files: [new File(['image.plop'], 'image.plop', { type: 'image/plop' })],
          },
        });

        expect(fileError.classList.length).toBe(3);

      });

      test("Then valid files should be accepted", () => {

        let fileError = document.querySelector(`[data-testid="file-error-message"]`);

        fireEvent.change(inputFile, {
          target: {
            files: [new File(['image.jpeg'], 'image.jpeg', { type: 'image/jpeg' })],
          },
        });

        expect(fileError.classList.length).toBe(4);

      });

    });

    //HandleSubmit
    describe("When i submit the form with a file ", () => {

      test("Then handleSubmit should be called", () => {

        const handleSubmit = jest.fn(NewBillObject.handleSubmit);
        NewBillObject.fileName = '';

        submitBttn.addEventListener('submit', handleSubmit);

        fireEvent.submit(submitBttn);

        //console.log("coucou test fireEvent",fireEvent);

        expect(handleSubmit).toHaveBeenCalled();
        expect(screen.getByTestId("btn-send-bill")).toBeTruthy();

      });

      describe("When i submit the form with a valid file", () => {
        test("Then BillsUI should be shown", () => {

          const handleSubmit = jest.fn(NewBillObject.handleSubmit);
          NewBillObject.fileName = "file.jpeg";
          NewBillObject.bypass = true;

          submitBttn.addEventListener("submit", handleSubmit);

          fireEvent.submit(submitBttn);

          expect(handleSubmit).toHaveBeenCalled();
          expect(screen.getByTestId("btn-new-bill")).toBeTruthy();

        });
      })

      describe("When i submit the form with an invalid file", () => {
        test("Then NewBillUi should be shown", () => {

          const handleSubmit = jest.fn(NewBillObject.handleSubmit);
          NewBillObject.fileName = '';
          NewBillObject.bypass = true;

          submitBttn.addEventListener('submit', handleSubmit);

          fireEvent.submit(submitBttn);

          expect(handleSubmit).toHaveBeenCalled();
          expect(screen.getByTestId("btn-send-bill")).toBeTruthy();

        });
      });
    });
  });
  //Test POST
  describe("WHEN I navigate to NewBill page and post a new bill", () => {
    test("THEN it adds a new bill on API with success", async () => {

      console.log(store);
      const testBill = bills[0];
      const spy = jest.spyOn(store, "post");
      const response = await store.post(testBill);
      expect(spy).toHaveBeenCalledTimes(1);
      expect(response.data.length).toBe(5);
    });
    describe("When an error occurs on API", () => {
      const testBill = bills[0];
      const postRequest = jest
      .fn(store.post)
      .mockImplementationOnce(() => Promise.reject(new Error('Erreur 404')))
      .mockImplementationOnce(() => Promise.reject(new Error('Erreur 500')))

      test("THEN it fails and returns 404 error message", async () => {
        let response;
          try {
            response = await postRequest(testBill)
          } catch (err){
            response = {error: err}
          }
          document.body.innerHTML = BillsUI(response);
          expect(screen.getByText(/Erreur 404/)).toBeTruthy();
      });
      test("THEN it fails and returns 500 error message", async () => {
        let response;
          try {
            response = await postRequest(testBill)
          } catch (err){
            response = {error: err}
          }
          document.body.innerHTML = BillsUI(response);
          expect(screen.getByText(/Erreur 500/)).toBeTruthy();
      });
    });
  });
})
