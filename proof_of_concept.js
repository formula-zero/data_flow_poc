const Aes = require('aes-256-gcm')
const crypto = require('crypto')
const eccrypto = require("eccrypto") // ECIES(Elliptic Curve Integrated Encryption scheme) - 통합 암호화 방식 (Public Key로 암호화하고 Private Key로 복호화)

async function test() {
	// 1. 데이터 owner 키 생성
	const dataOwner = {}
	dataOwner.privateKey = eccrypto.generatePrivate()
	dataOwner.publicKey = eccrypto.getPublic(dataOwner.privateKey)

	// 2. Worker 선정 담당자 키 생성
	const woerkerSelector = {}
	woerkerSelector.privateKey = eccrypto.generatePrivate()
	woerkerSelector.publicKey = eccrypto.getPublic(woerkerSelector.privateKey)

	// 3. Worker 키 생성
	const workers = []
	for (let i = 0 ; i < 5 ; i++) {
		const worker = {}
		worker.privateKey = eccrypto.generatePrivate()
		worker.publicKey = eccrypto.getPublic(worker.privateKey)

		workers.push(worker)
	}

	////--------------------------------------------------------

	// 4. 학습 데이터 생성
	const data = "hi"
	
	// 5. 데이터 암호화키 생성
	const SHARED_SECRET = '12345678901234567890123456789012'
	
	// 6. 데이터 암호화
	let { ciphertext, iv, tag } = Aes.encrypt(data, SHARED_SECRET)

	// 6. 데이터 암호화키 worker의 공개키로 암호화 
	encryptedSharedSecrets = []
	for (let i = 0 ; i < 5 ; i++) {
		const encryptedSharedSecret = await eccrypto.encrypt(workers[i].publicKey, Buffer.from(SHARED_SECRET, 'utf-8'))
		encryptedSharedSecrets.push(encryptedSharedSecret)
	}

	// 7. 암호화된 데이터 암호화키 worker 선정 담당자의 공개키로 암호화
	doubleEncryptedSharedSecrets = []
	for (let i = 0 ; i < 5 ; i++) {
		const encrypted = await eccrypto.encrypt(woerkerSelector.publicKey, JSON.stringify(encryptedSharedSecrets[i]))
		doubleEncryptedSharedSecrets.push(encrypted)
	}

	// 8. Worker 선정 담당자의 worker 선정 및 private key로 복호화 -> worker의 공개키로 암호화된 데이터 암호화키 반환
	selectedEncryptedSharedSecrets = []
	for (let i = 0 ; i < 5 ; i++) {
		let encryptedSharedSecret = await eccrypto.decrypt(woerkerSelector.privateKey, doubleEncryptedSharedSecrets[i])
		encryptedSharedSecret = JSON.parse(encryptedSharedSecret.toString())

		selectedEncryptedSharedSecret = {
			iv: Buffer.from(encryptedSharedSecret.iv.data),
			ephemPublicKey: Buffer.from(encryptedSharedSecret.ephemPublicKey.data),
			ciphertext: Buffer.from(encryptedSharedSecret.ciphertext.data),
			mac: Buffer.from(encryptedSharedSecret.mac.data)
		}
		selectedEncryptedSharedSecrets.push(selectedEncryptedSharedSecret)
	}

	// 9. 각 worker의 공개키로 데이터 암호화키 복호화 
	sharedSecrets = []
	for (let i = 0 ; i < 5 ; i++) {
		const plaintext = await eccrypto.decrypt(workers[i].privateKey, selectedEncryptedSharedSecrets[i])
		sharedSecrets.push(plaintext)
	}

	// 9. 데이터 암호화키로 데이터 복호화
	for (let i = 0 ; i < 5 ; i++) {
		let originalData = Aes.decrypt(ciphertext, iv, tag, sharedSecrets[i].toString());
		console.log(originalData)
	}
}

test()