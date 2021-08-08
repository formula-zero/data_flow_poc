# data_flow_poc

Access control on data by using Proxy Re-Encryption scheme

<img width="806" alt="스크린샷 2021-08-08 오후 2 51 01" src="https://user-images.githubusercontent.com/70733700/128622967-b3ee7e3a-c13d-4ab3-b7a7-d2e8dc7408fa.png">

1. Data Owner ← Blockchain
- Fetch a list of Worker’s ID including their public key ⇒ pk_w
- Fetch a public key for Worker selection node ⇒ pk_ws

2. Data Owner
- Encrypt data
  - Generate a random symmetric key to encrypt data ⇒ dek
  - Encrypt data with dek ⇒ enc_data
  - Encrypt dek with her public key pk_A ⇒  enc_dek
- Do proxy re-encryption on encryption key
  - Generate keys to re-encrypt enc dek for delegating decryption with Data owner’s private key and workers’ public keys. ⇒ reenc_key
- Assign reenc_key to only Worker selection node
  - Encrypt a list of reenc_key with a public key for Worker selection node ⇒ enc_reenc_keys
- Publish data on Storage and Blockchain
  - Upload enc_data on Storage and get a path for the data ⇒ s_path
  - Publish re-encryption keys, data’s storage path and encryption key on Blockchain

3. Worker Selection node
- Fetch re-encryption keys designated to it and decrypt them with its private key ⇒ reenc_keys
- Do process of selecting workers for a training task with the data
- Publish re-encrypted keys for selected workers on Blockchain
  - Proxy re-encrypt enc_dek with worker’s reenc_key ⇒ reenc_dek
- Notify the workers for the task

4. Workers
- Fetch information for the training task from Blockchain ⇒ s_path, reenc_dek
- Download enc_data from Storage by using s_path
- Decrypt the encryption key with reenc_dek ⇒ dek
- Decrypt the encrypted data with dek ⇒ data
