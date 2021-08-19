const Aes = require('aes-256-gcm')
const eccrypto = require("eccrypto")
const PRE = require('./lib/afgh_pre.js');

//Create the curve
PRE.init({g: "a", h: "b", returnHex: true}).then(async (params) => {
	// 1. 데이터 owner 키 생성
  const dataOwner = {}
	dataOwner.key = PRE.keyGenInG1(params, {returnHex: true})

	// 2. Worker 선정 담당자 키 생성
	// const woerkerSelector = {}
	// woerkerSelector.key = PRE.keyGenInG1(params, {returnHex: true})
	
	// 2. Worker 선정 담당자 키 생성
	const woerkerSelector = {key: {}}
	woerkerSelector.key.sk = eccrypto.generatePrivate()
	woerkerSelector.key.pk = eccrypto.getPublic(woerkerSelector.key.sk)

	// 3. Worker 키 생성
	const workers = []
	for (let i = 0 ; i < 5 ; i++) {
		const worker = {}
		worker.key = PRE.keyGenInG2(params, {returnHex: true})

		workers.push(worker)
	}

	// 4. 학습 데이터 생성
	const data = "hi"

	// 5. 데이터 암호화키 생성
	const SHARED_SECRET = '12345678901234567890123456789012' // 256bits (32bytes)
	// const SHARED_SECRET = PRE.randomGen();
	
	// 6. 데이터 암호화
	let { ciphertext, iv, tag } = Aes.encrypt(data, SHARED_SECRET)
	const encrypted = PRE.enc(SHARED_SECRET, dataOwner.key.pk, params, {returnHex: true})
	// const decrypted = PRE.dec(encrypted, dataOwner.key.sk, params)

	// 7. re-key 생성: 데이터 owner는 자신의 private key와 worker의 pbulic key를 활용하여 re-encryption key를 생성함
	const reEncryptionKeys = []
	for (let i = 0 ; i < 5 ; i++) {
		const reEncryptionKey = PRE.rekeyGen(dataOwner.key.sk, workers[i].key.pk, {returnHex: true})
		reEncryptionKeys.push(reEncryptionKey)
	}
    
	// 8. 각 worker의 re-key를 worker 선정 담당자의 공개키로 암호화
	const encryptedReEncryptionKeys = []
	for (let i = 0 ; i < 5 ; i++) {
		const encryptedReEncryptionKey = await eccrypto.encrypt(woerkerSelector.key.pk, JSON.stringify(reEncryptionKeys[i]))
		encryptedReEncryptionKeys.push(encryptedReEncryptionKey)
		// const encryptedReEncryptionKey = PRE.enc(reEncryptionKeys[i], woerkerSelector.key.pk, params, {returnHex: true})
		// encryptedReEncryptionKeys.push(encryptedReEncryptionKey)
	}

	// 8. Worker 선정 담당자의 worker 선정 및 private key로 복호화 -> worker의 re-encryption key 반환
	// 9. Worker 선정 담당자 re-recrypted 데이터 (암호화된 데이터 암호화키) 생성
	const decryptedReEncryptionKeys = []
	const reEncrypteds = []
	for (let i = 0 ; i < 5 ; i++) {
		let reEncryptionKey = await eccrypto.decrypt(woerkerSelector.key.sk, encryptedReEncryptionKeys[i])
		reEncryptionKey = JSON.parse(reEncryptionKey.toString())
		// const decryptedReEncryptionKey = PRE.dec(encryptedReEncryptionKeys[i], woerkerSelector.key.sk, params)
		// decryptedReEncryptionKeys.push(decryptedReEncryptionKey)

    const reEncypted = PRE.reEnc(encrypted, reEncryptionKey, {returnHex: true});
		reEncrypteds.push(reEncypted)
	}

	// 10. 각 worker의 개인키로 데이터 암호화키 복호화 
	const sharedSecrets = []
	for (let i = 0 ; i < 5 ; i++) {
		const sharedSecret = PRE.reDec(reEncrypteds[i], workers[i].key.sk);
		sharedSecrets.push(sharedSecret)
	}

	// 11. 데이터 암호화키로 데이터 복호화
	for (let i = 0 ; i < 5 ; i++) {
		let originalData = Aes.decrypt(ciphertext, iv, tag, sharedSecrets[i].toString());
		console.log(originalData)
	}
}).catch(err => {
    console.log(err)
});