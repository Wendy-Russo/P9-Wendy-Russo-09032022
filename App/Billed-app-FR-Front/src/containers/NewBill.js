import { ROUTES_PATH } from '../constants/routes.js';
import Logout from "./Logout.js"
import {bills} from "../fixtures/bills.js";

export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`)
    formNewBill.addEventListener("submit", this.handleSubmit)
    const file = this.document.querySelector(`input[data-testid="file"]`)
    file.addEventListener("change", this.handleChangeFile)

    this.fileUrl = null;
    this.fileName = null;
    this.billId = null;
    this.bypass = false;

    new Logout({ document, localStorage, onNavigate })
  }

  handleChangeFile = e => {

    e.preventDefault();



    const file = this.document.querySelector(`input[data-testid="file"]`).files[0];
    //console.log("file",file);

    const fileInput = this.document.querySelector(`input[data-testid="file"]`);
    //console.log("fileInput",fileInput);

    const fileName = fileInput.files[0].name;
    //console.log("fileName",fileName);

    let fileError = this.document.querySelector(`[data-testid="file-error-message"]`);
    fileError.setAttribute("class","text-danger p-1 font-weight-bold d-none");

    var allowedExtensions = /(\.jpg|\.jpeg|\.png)$/i;

    if(!allowedExtensions.exec(fileName)){
      //alert("File not valid");
      fileInput.value = fileInput.defaultValue;
      fileError.setAttribute("class","text-danger p-1 font-weight-bold");

    }
    else{
      fileError.setAttribute("class","text-danger p-1 font-weight-bold d-none");
    }

    const formData = new FormData();
    const email = JSON.parse(localStorage.getItem("user")).email;

    formData.append('file', file);
    formData.append('email', email);

    this.store
    /*
      .bills()

      .create({
        data: formData,
        headers: {
          noContentType: true
        }
      })

      .then(({fileUrl, key}) => {
        console.log(fileUrl)
        this.billId = key
        this.fileUrl = fileUrl
        this.fileName = fileName
      })
      .catch(error => console.error(error))*/
  }

  handleSubmit = e => {

    e.preventDefault()
    //console.log('e.target.querySelector(`input[data-testid="datepicker"]`).value', e.target.querySelector(`input[data-testid="datepicker"]`).value)

    if(this.fileName === ""){
      return null;
    }

    let bill;
    let email;

    if(!this.bypass){
      email = JSON.parse(localStorage.getItem("user")).email;
      bill = {
        email,
        type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
        name:  e.target.querySelector(`input[data-testid="expense-name"]`).value,
        amount: parseInt(e.target.querySelector(`input[data-testid="amount"]`).value),
        date:  e.target.querySelector(`input[data-testid="datepicker"]`).value,
        vat: e.target.querySelector(`input[data-testid="vat"]`).value,
        pct: parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) || 20,
        commentary: e.target.querySelector(`textarea[data-testid="commentary"]`).value,
        fileUrl: this.fileUrl,
        fileName: this.fileName,
        status: 'pending'
      }
    }
    else{
      bill = {
        email: bills[0].email ,
        type: bills[0].type,
        name:  bills[0].name,
        amount: bills[0].amount,
        date: bills[0].date,
        vat: bills[0].vat,
        pct: bills[0].pct,
        commentary: bills[0].commentary,
        fileUrl: this.fileUrl,
        fileName: this.fileName,
        status: 'pending'
      }
    }
    if (this.fileName !== null) {
      this.createBill(bill)
      this.onNavigate(ROUTES_PATH['Bills'])
    }
  }

  // not need to cover this function by tests
  updateBill = (bill) => {
    if (this.store) {
      this.store
      .bills()
      .update({data: JSON.stringify(bill), selector: this.billId})
      .then(() => {
        this.onNavigate(ROUTES_PATH['Bills'])
      })
      .catch(error => console.error(error))
    }
  }

  createBill = (bill) => {
    if (this.firestore) {
      this.firestore
      .bills()
      .add(bill)
      .then(() => {
        this.onNavigate(ROUTES_PATH['Bills'])
      })
      .catch(error => error)
    }
  }
}