const readline = require('readline')
const PRE = require('../lib/afgh_pre.js')
const fs = require('fs')
const util = require('util')
const Aes = require('aes-256-gcm')

const { params, recoveredFileDirPath, reEncryptedDecryptionKeyDirPath, workersJsonFilePath, workerKeyDirPath, encryptedFileDirPath } = require('./env')
let initiatedParams 
(async () => {
  initiatedParams = await PRE.init({g: "a", h: "b", returnHex: true})
})()

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

const readFile = util.promisify(fs.readFile)
const ask = function (questionText) {
  return new Promise((resolve, reject) => {
    rl.question(questionText, (input) => resolve(input) )
  })
}


const selectMenu = (answer) => {
  if(answer == 1) {
    return generateKeyFile()
  } else if(answer == 2) {
    return decrypteFile()
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

  const key = PRE.keyGenInG2(initiatedParams, {returnHex: true})
  const workers = require(workersJsonFilePath)
  
  let data = JSON.stringify(key)
  fs.writeFileSync(`${workerKeyDirPath}/${answer}.json`, data)

  workers[key.pk] = {
    keyFileName: answer
  }
  
  data = JSON.stringify(workers)
  fs.writeFileSync(workersJsonFilePath, data)
  
  console.log('Complete to generate key')
  rl.close()
}

const selectWorker = async () => {
  const workers = require(workersJsonFilePath)
  const workerPks = Object.keys(workers)
  const workerSize = workerPks.length
  
  for(let i = 0 ; i < workerSize; i++) {
    console.log(`${i+1}: ${workerPks[i]}`)
  }
  answer = await ask(`Please select a worker [1 ~ ${workerSize}]: `)

  const keyFileName = workers[workerPks[answer-1]].keyFileName
  const selectedWorker =  require(`${workerKeyDirPath}/${keyFileName}.json`)
  selectedWorker.keyFileName = keyFileName
  return selectedWorker
}

const decrypteFile = async () => {
  const selectedWorker = await selectWorker()

  answer = await ask("Input a file name for decryption: ")
	while (!answer || !answer.trim()) {
    console.log('Please input a file name')
    answer = await ask("Input a file name for decryption: ")
	}
  const fileName = answer
  const {ciphertext, iv, tag} = require((`${encryptedFileDirPath}/${fileName}.json`))
  const reEncryptedDecryptionKeys = require((`${reEncryptedDecryptionKeyDirPath}/${fileName}.json`))

  if(reEncryptedDecryptionKeys.hasOwnProperty(selectedWorker.pk)) {
    // console.log(selectedWorker)
    const decryptionKey = PRE.reDec(reEncryptedDecryptionKeys[selectedWorker.pk], selectedWorker.sk);
    // console.log(decryptionKey)
    //console.log(encryptedFileInfo)
    //console.log(reEncryptedDecryptionKeys)
    const originalData = Aes.decrypt(ciphertext, iv, tag, decryptionKey.toString());
    fs.writeFileSync(`${recoveredFileDirPath}/${fileName}.txt`, originalData)
    console.log('Complete to decrypt the file')
  } else {
    console.log('The worker has no re-encrypted-decription key')
  }

  rl.close()
}

const run = () => {
  console.clear()
  rl.question('1. Generate worker key\n2. Decrypt a file\n>>', selectMenu)
}

run()