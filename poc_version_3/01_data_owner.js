const readline = require('readline')
const PRE = require('../lib/afgh_pre.js')
const fs = require('fs')
const util = require('util')
const Aes = require('aes-256-gcm')
const eccrypto = require("eccrypto")

const { params, reencryptionKeyDirPath, dataOwnersJsonFilePath, encryptedFileDirPath, dataOwnerKeyDirPath, workersJsonFilePath, workerSelectorsJsonFilePath, originFileDirPath} = require('./env')
let initiatedParams 
(async () => {
  initiatedParams = await PRE.init({g: "a", h: "b", returnHex: true})
})()

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

const readFile = util.promisify(fs.readFile);
const ask = function (questionText) {
  return new Promise((resolve, reject) => {
    rl.question(questionText, (input) => resolve(input) );
  });
}

const selectMenu = (answer) => {
  if(answer == 1) {
    return generateKeyFile()
  } else if(answer == 2) {
    return encryptFile()
  } else if(answer == 3) {
    return generateReEncryptionKey()
  } else {
    console.log('Wrong answer')
    setTimeout(() => { run() }, 1000) 
  }
}

const generateKeyFile = async () => {
  let answer = await ask("Input the key file name: ")
	while (!answer || !answer.trim()) {
    answer = await ask("Input the key file name: ")
	}

  const key = PRE.keyGenInG1(initiatedParams, {returnHex: true})
  const dataOwners = require(dataOwnersJsonFilePath)
  key.reEncryptionKeys = {}
  
  let data = JSON.stringify(key)
  fs.writeFileSync(`${dataOwnerKeyDirPath}/${answer}.json`, data)

  data = JSON.stringify({})
  fs.writeFileSync(`${reencryptionKeyDirPath}/${answer}.json`, data)

  dataOwners[key.pk] = {
    keyFileName: answer
  }
  
  data = JSON.stringify(dataOwners)
  fs.writeFileSync(dataOwnersJsonFilePath, data)
  
  console.log('Complete to generate key')
  rl.close()
}

const selectDataOwner = async () => {
  const dataOwners = require(dataOwnersJsonFilePath)
  const dataOwnerPks = Object.keys(dataOwners)
  const dataOwnerSize = dataOwnerPks.length
  
  for(let i = 0 ; i < dataOwnerSize; i++) {
    console.log(`${i+1}: ${dataOwnerPks[i]}`)
  }
  answer = await ask(`Please select data owner [1 ~ ${dataOwnerSize}]: `)

  const keyFileName = dataOwners[dataOwnerPks[answer-1]].keyFileName
  const selectedDataOwner =  require(`${dataOwnerKeyDirPath}/${keyFileName}.json`)
  selectedDataOwner.keyFileName = keyFileName
  return selectedDataOwner
}

const encryptFile = async () => {
  const selectedDataOwner = await selectDataOwner()

  answer = await ask("Input a file name for encryption: ")
	while (!answer || !answer.trim()) {
    console.log('Please input a file name')
    answer = await ask("Input a file name for encryption: ")
	}

  const data = await readFile(`${originFileDirPath}/${answer}.txt`, 'utf8')

  const SHARED_SECRET = '12345678901234567890123456789012'

  let encryptedData = Aes.encrypt(data, SHARED_SECRET)
  encryptedData.encryptedDecryptionKey = PRE.enc(SHARED_SECRET, selectedDataOwner.pk, initiatedParams, {returnHex: true})
  encryptedData.dataOwner = selectedDataOwner.pk

  encryptedData = JSON.stringify(encryptedData)
  fs.writeFileSync(`${encryptedFileDirPath}/${answer}.json`, encryptedData)

  console.log('Complete to encrypt the file')
  rl.close()
}

const generateReEncryptionKey = async () => {
  const selectedDataOwner = await selectDataOwner()
  console.log(selectedDataOwner)

  const workerSelectors = require(workerSelectorsJsonFilePath)
  const workerSelectorPks = Object.keys(workerSelectors)
  const workerSelectorSize = workerSelectorPks.length

  for(let i = 0 ; i < workerSelectorSize ; i++) {
    console.log(`${i+1}: ${workerSelectorPks[i]}`)
  }
  answer = await ask(`Please select a worker selector [1 ~ ${workerSelectorSize}]: `)
  
  const selectedWorkerSelectorPk = workerSelectorPks[answer-1]
  const selectedWorkerSelectorPkBuffter = Buffer.from(selectedWorkerSelectorPk, 'hex')
  
  const workers = require(workersJsonFilePath)
  const workerPks = Object.keys(workers)
  const workerSize = workerPks.length
  const reEncryptionKeys = require(`${reencryptionKeyDirPath}/${selectedDataOwner.keyFileName}.json`)

  for(let i = 0 ; i < workerSize ; i++) {
    const reEncryptionKey = PRE.rekeyGen(selectedDataOwner.sk, workerPks[i], {returnHex: true})
    const encryptedReEncryptionKey = await eccrypto.encrypt(selectedWorkerSelectorPkBuffter, JSON.stringify(reEncryptionKey))
    
    encryptedReEncryptionKey.iv = encryptedReEncryptionKey.iv.toString('hex')
    encryptedReEncryptionKey.ephemPublicKey = encryptedReEncryptionKey.ephemPublicKey.toString('hex')
    encryptedReEncryptionKey.ciphertext = encryptedReEncryptionKey.ciphertext.toString('hex')
    encryptedReEncryptionKey.mac = encryptedReEncryptionKey.mac.toString('hex')
    
    reEncryptionKeys[selectedWorkerSelectorPk] = reEncryptionKeys[selectedWorkerSelectorPk] || {}
    reEncryptionKeys[selectedWorkerSelectorPk][workerPks[i]] = encryptedReEncryptionKey    
  }

  const data = JSON.stringify(reEncryptionKeys)
  fs.writeFileSync(`${reencryptionKeyDirPath}/${selectedDataOwner.keyFileName}.json`, data)

  console.log('Complete to generate reencryption key')
  rl.close()
}

const run = () => {
  console.clear();
  rl.question('1. Generate worker key\n2. Encrypt a file\n3. Generate re-encryption key\n>>', selectMenu)
}

run()