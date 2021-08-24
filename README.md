# Process of poc version 3

- 1. Create keys (can skip)

    ```bash
    # Data owner
    **> node 01_data_owner.js**

    1. Generate worker key
    2. Encrypt a file
    3. Generate re-encryption key
    >>1
    Input the key file name: test.json
    Complete to generate key
    The data owner pk is 7864ce41c8102ba08fd6b88e93dfcf988791d128e8d6237361231ee2fea848c219979324a2fa74f2fac399d074af348b

    # Worker selector
    > **node 02_worker_selector.js**

    1. Generate worker selector key
    2. Select worker of a encrypted file
    **>>1**
    Input the key file name: **worker_selector_2**
    Complete to generate key
    The worker selector pk is 044f143340ec39c7378cfa7e4be61688bb63a63142ae394a14b5b55a52eac9fceb8b51588967e535fa0f1deddc11375e0cf6eb6ef4b0302abd2bca6b242d354435

    # Worker (Repeat 3 ~ 5 times)
    **> node 03_worker.js**

    1. Generate worker key
    2. Decrypt a file
    >>**1**
    Input the key file name: **worker4**
    Complete to generate key
    The worker pk is c9c97b9ddb895e286e30b23532d66a86733e1c044407007bd2990cd371ad9c19b14685ec978db7dbe3869911fbd4bc0417b7549498a66d90654d38fb0544b2284808fa79660b69e6258379ed22a38ac9ee4edee5158a0c1fda43764543398803
    ```

- 2. Encrypt a file

    ```bash
    # Data owner
    **> node 01_data_owner.js**

    1. Generate worker key
    2. Encrypt a file
    3. Generate re-encryption key
    >>**2**
    1: c42d54f9414db5dcbece12b3c555fc37a5b779c9c2d94908d12d6ef84af8aa7adb0317caef3874db6f2ca8024c65a509
    Please select data owner [1 ~ 1]: **1**
    Input a file name for encryption: **test.txt**
    Complete to encrypt the file
    ```

- 3. Generate re-encryption keys (generate all worker re-encryption keys about worker selector)

    ```bash
    # Data owner
    **> node 01_data_owner.js**

    1. Generate worker key
    2. Encrypt a file
    3. Generate re-encryption key
    **>>3**
    1: c42d54f9414db5dcbece12b3c555fc37a5b779c9c2d94908d12d6ef84af8aa7adb0317caef3874db6f2ca8024c65a509
    Please select data owner [1 ~ 1]: **1**
    1: 049f7fc6f43fd3ce1121057e3a9ac3dc2c56043332f1ce66a6b0bfa48741cc8e459df52281a08be932394a771b162b4127a3e381b6f7d9efbbe8fdbc43674b24b3
    Please select a worker selector [1 ~ 1]: **1**
    Complete to generate reencryption key
    ```

- 4. Select worker

    ```bash
    # Worker selector
    > **node 02_worker_selector.js**

    1. Generate worker selector key
    2. Select worker of a encrypted file
    **>>2**
    1: 049f7fc6f43fd3ce1121057e3a9ac3dc2c56043332f1ce66a6b0bfa48741cc8e459df52281a08be932394a771b162b4127a3e381b6f7d9efbbe8fdbc43674b24b3
    Please select worker selector [1 ~ 1]: **1**
    Input the encrypted file name: **test.txt**
    1: e8a9c41b711b9c9a14520a934e38b7986cc96fb652126deebd756d493750340de6c1cbb2effd3fb451cb71cfcbb83913e999facf647f134b03bab5896ff45a915f6769b49e36f1d7a8272c2c99f0cd5038388dc5ec239a485fa9fb63732e5189
    Do you want to select the worker? (y/n): **y**
    2: ebb988ce04daf9056c8ff95975b142daa41aa00d28173b1ae9cf482329b667a60d16f9739a640f13b5eb2548bb4e8115a9f0fc7fb5b8c0d63d1010ddf49dc3396a23bae58f6882c672d3bda4b84cbc81b9b38de7cf4af55d939eb5a471e3c38e
    Do you want to select the worker? (y/n): **y**
    3: 7a754afb6f203bc574bed4e4479a1c0d7bd55947727c241e1205bcde8d801cf1e96461a5ee68d28121217eed07e4ff070a8ee7e7fbd64d9dc9227a8ea5310ebc8afd987e9381d1363a83d9d5081ca1754f277621148f0c6bfd2d29ec5c28a888
    Do you want to select the worker? (y/n): **n**
    Complete to select workers
    ```

- 5. Decrypt the encrypted-file

    ```bash
    # Worker
    **> node 03_worker.js**

    1. Generate worker key
    2. Decrypt a file
    **>>2**
    1: e8a9c41b711b9c9a14520a934e38b7986cc96fb652126deebd756d493750340de6c1cbb2effd3fb451cb71cfcbb83913e999facf647f134b03bab5896ff45a915f6769b49e36f1d7a8272c2c99f0cd5038388dc5ec239a485fa9fb63732e5189
    2: ebb988ce04daf9056c8ff95975b142daa41aa00d28173b1ae9cf482329b667a60d16f9739a640f13b5eb2548bb4e8115a9f0fc7fb5b8c0d63d1010ddf49dc3396a23bae58f6882c672d3bda4b84cbc81b9b38de7cf4af55d939eb5a471e3c38e
    3: 7a754afb6f203bc574bed4e4479a1c0d7bd55947727c241e1205bcde8d801cf1e96461a5ee68d28121217eed07e4ff070a8ee7e7fbd64d9dc9227a8ea5310ebc8afd987e9381d1363a83d9d5081ca1754f277621148f0c6bfd2d29ec5c28a888
    Please select a worker [1 ~ 3]: **1**
    Input a file name for decryption: **test.txt**
    Complete to decrypt the file
    ```