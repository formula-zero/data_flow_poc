const params = {
  g: "a",  // G1
  h: "b",  // G2
  returnHex: true
}

const dataOwnersJsonFilePath = "./data_owner_list.json"
const workerSelectorsJsonFilePath = "./worker_selector_list.json"
const workersJsonFilePath = "./worker_list.json"

const dataOwnerKeyDirPath = "./keys/data_owner"
const workerSelectorKeyDirPath = "./keys/worker_selector"
const workerKeyDirPath = "./keys/worker"
const reencryptionKeyDirPath = "./keys/reencryption_key"
const reEncryptedDecryptionKeyDirPath = "./keys/reencrypted_decription_key"

const originFileDirPath = "./origin_files"
const recoveredFileDirPath = "./recovered_files"
const encryptedFileDirPath = "./encrypted_files"

exports.params = params

exports.dataOwnersJsonFilePath = dataOwnersJsonFilePath 
exports.workerSelectorsJsonFilePath = workerSelectorsJsonFilePath 
exports.workersJsonFilePath = workersJsonFilePath

exports.dataOwnerKeyDirPath = dataOwnerKeyDirPath 
exports.workerSelectorKeyDirPath = workerSelectorKeyDirPath 
exports.workerKeyDirPath = workerKeyDirPath 
exports.reencryptionKeyDirPath = reencryptionKeyDirPath 
exports.reEncryptedDecryptionKeyDirPath = reEncryptedDecryptionKeyDirPath 

exports.originFileDirPath = originFileDirPath 
exports.recoveredFileDirPath = recoveredFileDirPath 
exports.encryptedFileDirPath = encryptedFileDirPath 

