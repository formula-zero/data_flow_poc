const readline = require('readline')
const eccrypto = require('eccrypto')
const PRE = require('../lib/afgh_pre.js')
const fs = require('fs')
const util = require('util')

const { params, reEncryptedDecryptionKeyDirPath, reencryptionKeyDirPath, encryptedFileDirPath, dataOwnersJsonFilePath, workersJsonFilePath, workerSelectorsJsonFilePath, workerSelectorKeyDirPath } = require('./env')
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
    return selectWorkerForEncryptedFile()
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

  const key = {}
  key.sk = eccrypto.generatePrivate()
	key.pk = eccrypto.getPublic(key.sk).toString('hex')
  key.sk = key.sk.toString('hex')

  const workerSelectors = require(workerSelectorsJsonFilePath)

  let data = JSON.stringify(key, null, 2)
  fs.writeFileSync(`${workerSelectorKeyDirPath}/${answer}.json`, data)

  workerSelectors[key.pk] = {
    keyFileName: answer
  }
  
  data = JSON.stringify(workerSelectors, null, 2)
  fs.writeFileSync(workerSelectorsJsonFilePath, data)
  
  console.log('Complete to generate key')
  console.log('The worker selector pk is', key.pk)
  rl.close()
}

const selectWorkerForEncryptedFile = async () => {
  const workerSelectors = require(workerSelectorsJsonFilePath)
  const workerSelectorPks = Object.keys(workerSelectors)
  const workerSelectorSize = workerSelectorPks.length

  const workers = require(workersJsonFilePath)
  const workerPks = Object.keys(workers)
  const workerSize = workerPks.length

  const dataOwners = require(dataOwnersJsonFilePath)
  const dataOwnerPks = Object.keys(dataOwners)
  const dataOwnerSize = dataOwnerPks.length

  for(let i = 0 ; i < workerSelectorSize; i++) {
    console.log(`${i+1}: ${workerSelectorPks[i]}`)
  }
  let answer = await ask(`Please select worker selector [1 ~ ${workerSelectorSize}]: `)

  const selectedWorkerSelector = require(`${workerSelectorKeyDirPath}/${workerSelectors[workerSelectorPks[answer-1]].keyFileName}.json`)
  selectedWorkerSelector.pkBuffer = Buffer.from(selectedWorkerSelector.pk, 'hex')
  selectedWorkerSelector.skBuffer = Buffer.from(selectedWorkerSelector.sk, 'hex')

  answer = await ask("Input the encrypted file name: ")
	while (!answer || !answer.trim()) {
    console.log('Please input the encrypted file name')
    answer = await ask("Input the encrypted file name: ")
	}

  const fileName = answer.split(".")[0]
  const fileExtension = answer.split(".")[1]
  const reEncryptedDecryptionKeys = {}
  const encryptedFileInfo = require((`${encryptedFileDirPath}/${fileName}.json`))
  const encryptedReEncryptionKeys = require((`${reencryptionKeyDirPath}/${dataOwners[encryptedFileInfo.dataOwner].keyFileName}.json`))[selectedWorkerSelector.pk]

  for(let i = 0 ; i < workerSize; i++) {
    console.log(`${i+1}: ${workerPks[i]}`)
    answer = await ask(`Do you want to select the worker? (y/n): `)

    if(answer === 'y' || answer === 'Y') {
      const encryptedReEncryptionKey = encryptedReEncryptionKeys[workerPks[i]]
      encryptedReEncryptionKey.iv = Buffer.from(encryptedReEncryptionKey.iv, 'hex')
      encryptedReEncryptionKey.ephemPublicKey = Buffer.from(encryptedReEncryptionKey.ephemPublicKey, 'hex')
      encryptedReEncryptionKey.ciphertext = Buffer.from(encryptedReEncryptionKey.ciphertext, 'hex')
      encryptedReEncryptionKey.mac = Buffer.from(encryptedReEncryptionKey.mac, 'hex')
    
      let reEncryptionKey = await eccrypto.decrypt(selectedWorkerSelector.skBuffer, encryptedReEncryptionKey)
      reEncryptionKey = JSON.parse(reEncryptionKey.toString())

      const reEncryptedDecryptionKey = PRE.reEnc(encryptedFileInfo.encryptedDecryptionKey, reEncryptionKey, {returnHex: true});
      reEncryptedDecryptionKeys[workerPks[i]] = reEncryptedDecryptionKey
    }
  }
  
  const data = JSON.stringify(reEncryptedDecryptionKeys, null, 2)
  fs.writeFileSync(`${reEncryptedDecryptionKeyDirPath}/${fileName}.json`, data)

  console.log('Complete to select workers')
  rl.close()
}

const run = () => {
  console.clear()
  rl.question('1. Generate worker selector key\n2. Select worker of a encrypted file\n>>', selectMenu)
}

run()