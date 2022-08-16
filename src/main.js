const pass = [
  {
    name: "BTS concert",
    image: "https://cutt.ly/zXdFrsa",
    description: `Dance Dance Dance.`,
    location: "Korea",
    owner: "0x32Be343B94f860124dC4fEe278FDCBD38C102D88",
    price: 17,
    sold: 50,
    index: 0,
  },
  {
    name: "The Bieber concert",
    image: "https://bit.ly/3w7I7oN",
    description: `Dance Dance Dance.`,
    location: "korea",
    owner: "0x3275B7F400cCdeBeDaf0D8A9a7C8C1aBE2d747Ea",
    price: 10,
    sold: 23,
    index: 1,
  },
  {
    name: "Ariana concert",
    image: "https://cutt.ly/9XdSS1s",
    description: `Dance Dance Dance.`,
    location: "New York",
    owner: "0x2EF48F32eB0AEB90778A2170a0558A941b72BFFb",
    price: 15,
    sold: 15,
    index: 2,
  },
  {
    name: "Disney live show",
    image: "https://cutt.ly/EXdDGVI",
    description: `Dance Dance Dance.`,
    location: "Los Angeles",
    owner: "0x2EF48F32eB0AEB90778A2170a0558A941b72BFFb",
    price: 30,
    sold: 50,
    index: 3,
  },
]
const getBalance = function () {
  document.querySelector("#balance").textContent = 21
}
function renderpass() {
  document.getElementById("marketplace").innerHTML = ""
  pass.forEach((_pass) => {
    const newDiv = document.createElement("div")
    newDiv.className = "col-md-4"
    newDiv.innerHTML = passTemplate(_pass)
    document.getElementById("marketplace").appendChild(newDiv)
  })
}
function passTemplate(_pass) {
  return `
    <div class="card mb-4">
      <img class="card-img-top" src="${_pass.image}" alt="...">
      <div class="position-absolute top-0 end-0 bg-warning mt-4 px-2 py-1 rounded-start">
        ${_pass.sold} Sold
      </div>
            <div class="card-body text-left p-4 position-relative">
        <div class="translate-middle-y position-absolute top-0">
        ${identiconTemplate(_pass.owner)}
        </div>
        <h2 class="card-title fs-4 fw-bold mt-2">${_pass.name}</h2>
        <p class="card-text mb-4" style="min-height: 82px">
          ${_pass.description}             
        </p>
        <p class="card-text mt-4">
          <i class="bi bi-geo-alt-fill"></i>
          <span>${_pass.location}</span>
        </p>
        <div class="d-grid gap-2">
          <a class="btn btn-lg btn-outline-dark buyBtn fs-6 p-3" id=${
            _pass.index
          }>
            Buy for ${_pass.price} cUSD
          </a>
        </div>
      </div>
    </div>
  `
}
function identiconTemplate(_address) {
  const icon = blockies
    .create({
      seed: _address,
      size: 8,
      scale: 16,
    })
    .toDataURL()

  return `
  <div class="rounded-circle overflow-hidden d-inline-block border border-white border-2 shadow-sm m-0">
    <a href="https://alfajores-blockscout.celo-testnet.org/address/${_address}/transactions"
        target="_blank">
        <img src="${icon}" width="48" alt="${_address}">
    </a>
  </div>
  `
}
function notification(_text) {
  document.querySelector(".alert").style.display = "block"
  document.querySelector("#notification").textContent = _text
}

function notificationOff() {
  document.querySelector(".alert").style.display = "none"
}
window.addEventListener("load", () => {
  notification("⌛ Loading...")
  getBalance()
  renderpass()
  notificationOff()
})
document
  .querySelector("#newpassBtn")
  .addEventListener("click", () => {
    const _pass = {
      owner: "0x2EF48F32eB0AEB90778A2170a0558A941b72BFFb",
      name: document.getElementById("newpassName").value,
      image: document.getElementById("newImgUrl").value,
      description: document.getElementById("newpassDescription").value,
      location: document.getElementById("newLocation").value,
      price: document.getElementById("newPrice").value,
      sold: 0,
      index: pass.length,
    }
    pass.push(_pass)
    notification(`🎉 You successfully added "${_pass.name}".`)
    renderpass()
  })
  document.querySelector("#marketplace").addEventListener("click", (e) => {
  if(e.target.className.includes("buyBtn")) {
    const index = e.target.id
    pass[index].sold++
    notification(`🎉 You successfully bought "${pass[index].name}".`)
    renderpass()
  }
})
import Web3 from "web3"
import { newKitFromWeb3 } from "@celo/contractkit"
import BigNumber from "bignumber.js"
import marketplaceAbi from "../contract/marketplace.abi.json"
import erc20Abi from "../contract/erc20.abi.json"
import {cUSDContractAddress, MPContractAddress ,ERC20_DECIMALS} from "./utils/constants";

// const ERC20_DECIMALS = 18
// const MPContractAddress = "0xf7066dC2066e598842144D6C4516b977a77fDd55"
// const cUSDContractAddress = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1"

let kit
let contract
let passes = []
let adminAddress

const connectCeloWallet = async function () {
  if (window.celo) {
    notification("⚠️ Please approve this DApp to use it.")
    try {
      await window.celo.enable()
      notificationOff()

      const web3 = new Web3(window.celo)
      kit = newKitFromWeb3(web3)

      const accounts = await kit.web3.eth.getAccounts()
      kit.defaultAccount = accounts[0]

      contract = new kit.web3.eth.Contract(marketplaceAbi, MPContractAddress)
    } catch (error) {
      notification(`⚠️ ${error}.`)
    }
  } else {
    notification("⚠️ Please install the Celo Extension Wallet.")
  }
}

const approve = async (price) => {
    const cUSDContract = new kit.web3.eth.Contract(erc20Abi, cUSDContractAddress); // Create a contract object using the cUSD contract

    const result = await cUSDContract.methods
        .approve(MPContractAddress, price)
        .send({ from: kit.defaultAccount });
    return result;
}


const getBalance = async function () {
  const totalBalance = await kit.getTotalBalance(kit.defaultAccount)
  const cUSDBalance = totalBalance.cUSD.shiftedBy(-ERC20_DECIMALS).toFixed(2)
  document.querySelector("#balance").textContent = cUSDBalance
}

const getAdminAddress = async function() {
  adminAddress = await contract.methods.adminAddress().call()

}


const getpass = async function() {
  const _passLength = await contract.methods.getpassLength().call()
  const _pass = []
  for (let i = 0; i < _passLength; i++) {
    let _pass = new Promise(async (resolve, reject) => {
      let p = await contract.methods.pass(i).call()
      resolve({
        index: i,
        owner: p[0],
        name: p[1],
        image: p[2],
        description: p[3],
        location: p[4],
        price: new BigNumber(p[5]),
        sold: p[6],
        verified : p[7]
      });
      reject(error => { console.log(error) });
    });
    _pass.push(_pass)
  }
  pass = await Promise.all(_pass)
  renderpass()
}

function renderpass() {
  document.getElementById("marketplace").innerHTML = ""
  pass.forEach((_pass) => {
    const newDiv = document.createElement("div")
    newDiv.className = "col-md-4"
    newDiv.innerHTML = passTemplate(_pass)
    document.getElementById("marketplace").appendChild(newDiv)
  })
}

function passTemplate(_pass) {
  const passsold = parseInt(_pass.sold);

  return `
  <div class="card border-secondary mb-4">
  <img class="card-img-top" src="${_pass.image}" alt="Card image">
  <div class="position-absolute top-0 end-0 bg-warning mt-4 px-2 py-1 rounded-start">
    ${passsold} Sales  
  </div>
      <div class="card-body text-left p-4 position-relative">
        <div class="translate-middle-y position-absolute top-0">
<!--        ${identiconTemplate(_pass.owner)}-->
        </div>
        <h2 class="card-title fs-4 fw-bold mt-2">${_pass.name}</h2>
        <p class="card-text mb-4" style="min-height: 82px">
          ${_pass.description}             
        </p>
        <p class="card-text mt-4">
          <i class="bi bi-geo-alt-fill"></i>
          <span>${_pass.location}</span>
        </p>
        <div class="d-grid gap-2">
        
        
       ${payButtonTemplate(_pass)}
    </div>
      </div>
    </div>
  `
}

function payButtonTemplate(_pass) {


  if(!_pass.verified){

    if(kit.defaultAccount === adminAddress){
      return `
   <a class="btn btn-lg verifyBtn fs-6 p-3  btn-outline-dark"  id=${_pass.index}>
            Verify This Pass
        </a>
  `
    }
    return `
<a class="btn btn-lg fs-6 p-3  btn-secondary disabled ">
            Not Yet Verified
        </a>
   
  `

  }

else {
    const passPrice = (_pass.price / Math.pow(10, ERC20_DECIMALS).toFixed(2));
    return `
  <a class="btn btn-lg buyBtn fs-6 p-3  btn-outline-dark"
       id=${_pass.index}>
      Buy for ${passPrice} cUSD
     </a>
  `
  }










}




function identiconTemplate(_address) {
  const icon = blockies
    .create({
      seed: _address,
      size: 8,
      scale: 16,
    })
    .toDataURL()

  return `
  <div class="rounded-circle overflow-hidden d-inline-block border border-white border-2 shadow-sm m-0">
    <a href="https://alfajores-blockscout.celo-testnet.org/address/${_address}/transactions"
        target="_blank">
        <img src="${icon}" width="20" alt="${_address}">
    </a>
  </div>
  `
}

function notification(_text) {
  document.querySelector(".alert").style.display = "block"
  document.querySelector("#notification").textContent = _text
}

function notificationOff() {
  document.querySelector(".alert").style.display = "none"
}

window.addEventListener("load", async () => {
  notification("⌛ Loading...")
  await connectCeloWallet()
  await getBalance()
  await getAdminAddress()
  await getpass()

  notificationOff()
});

document.querySelector("#newpassBtn").addEventListener("click", async () => {
  const name = document.getElementById("newpassName").value;
  const imageUrl = document.getElementById("newImgUrl").value;
  const description = document.getElementById("newpassDescription").value;
  const price = document.getElementById("newPrice").value;
  const location = document.getElementById("newLocation").value;

  if (!name || !imageUrl || !location || !description || !price) {
      notification("⚠️ Please fill in all fields in the form.");
      return;
  }

  const params = [
      name,
      imageUrl,
      location,
      description,
      // Create a bigNumber object so the contract can read it
      new BigNumber(price).shiftedBy(ERC20_DECIMALS).toString()
  ];
  notification(`⌛ Adding "${params[0]}"...`);
  contract.methods.writepass(...params).send({ from: kit.defaultAccount }).then(async (res) => {
      console.log(res);
      notification(`🎉 You successfully added "${params[0]}".`);
      await getpass();
  }).catch(err => {
      console.log(err);
      notification(`⚠️ ${error}.`);
  });
});

  document.querySelector("#marketplace").addEventListener("click", async (e) => {
    if (e.target.className.includes("buyBtn")) {
      console.log("buyBtn Clicked")
      const index = e.target.id
      notification("⌛ Waiting for payment approval...")
      try {
        await approve(pass[index].price)
      } catch (error) {
        notification(`⚠️ ${error}.`)
      }
      notification(`⌛ Awaiting payment for "${pass[index].name}"...`)
      try {
        contract.methods
          .buypass(index)
          .send({ from: kit.defaultAccount })
        notification(`🎉 You successfully bought "${pass[index].name}".`)
        getpass()
        getBalance()
        return
      } catch (error) {
        notification(`⚠️ ${error}.`)
      }
    }


    if (e.target.className.includes("verifyBtn")) {

      console.log("verifyBtn Clicked")
      const index = e.target.id
      console.log({
      e
    })
      notification(`⌛Verifying "${pass[index].name}"...`)
      try {
        const result = await contract.methods
            .verifypass(index)
            .send({ from: kit.defaultAccount })
        notification(`🎉 You successfully verified "${pass[index].name}".`)
        getpass()
        getBalance()

      } catch (error) {
        notification(`⚠️ ${error}.`)
      }
    }


  })


