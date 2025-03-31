/*
This file is added to allow us to not annoy the user with prompts for
a recoverykey or pass phrase
*/
import { deriveRecoveryKeyFromPassphrase } from "matrix-js-sdk/src/crypto-api";
import { MatrixClientPeg } from "./MatrixClientPeg";
import { withSecretStorageKeyCache } from "./SecurityManager";

import InteractiveAuthDialog from "./components/views/dialogs/InteractiveAuthDialog";

export function isUserlessRecoveryPhraseFeatureTurnedOn() {
    return false;
}

export async function setupCrossSigningKeysWithPassphrase({completeFunction}) {
  console.log('RJM setupCrossSigningKeysWithPassphrase');

  const recoveryKeySecurityPhrase = "Temp34HardCoded34.....Phrase1";

  const cli = MatrixClientPeg.safeGet();
  const crypto = cli.getCrypto();
  const defaultKeyId = await cli.secretStorage.getDefaultKeyId();

  console.log('RJM defaultKeyId', defaultKeyId);

  const keys = await cli.secretStorage.isStored("m.cross_signing.master");
  console.log('RJM keys', keys)

  await withSecretStorageKeyCache(async () => {
    if (keys.hasOwnProperty(defaultKeyId)) {
        console.log('RJM not implemented found default key in stored keys')
    } else {
        console.log('RJM no default keys')
        const recoveryKey = await crypto.createRecoveryKeyFromPassphrase(recoveryKeySecurityPhrase);
        console.log('RJM no default keys', recoveryKey)
        await crypto.bootstrapSecretStorage({
            createSecretStorageKey: async () => recoveryKey,
            setupNewSecretStorage: true,
            setupNewKeyBackup: true
        });
        // The key has now been cached
        const reloadedKeys = await cli.secretStorage.isStored("m.cross_signing.master");
        console.log('RJM reloadedKeys', reloadedKeys)

        console.log('RJM bootstrapCrossSigning credentials=', cli.credentials)
        await crypto.bootstrapCrossSigning({
            authUploadDeviceSigningKeys: async (makeRequest) => {
                const authDict = {};
                return makeRequest(authDict);
            },
        });
        console.log('RJM checking if there is a key backup')
        const hasKeyBackup = (await matrixClient.getCrypto().checkKeyBackupAndEnable()) !== null;
        if (!hasKeyBackup) {
            console.log('RJM resetKeyBackup')
            // Create the key backup
            await matrixClient.getCrypto().resetKeyBackup();
        };
        console.log('RJM here')
    }
  });


  // const key = deriveRecoveryKeyFromPassphrase(recoveryKeySecurityPhrase, keyInfo.passphrase.salt, keyInfo.passphrase.iterations);

  console.log('RJM a', completeFunction)
  completeFunction();
  console.log('RJM b')
}


// //RJM Temporary Change Start
// //  In future set up recovery key modes on of which could be to obtain
// //   the key from some kind of user token
// const recoveryKeySecurityPhrase = "Temp34HardCoded34.....Phrase1"
// if (recoveryKeySecurityPhrase !== '') {
//     const input = { passphrase: recoveryKeySecurityPhrase };
//     const key = await inputToKey(input);
//     if (MatrixClientPeg.safeGet().secretStorage.checkKey(key, keyInfo)) {
//         cacheSecretStorageKey(keyId, keyInfo, key);
//         return [keyId, key];
//     }
//
//     // Key not set up at all - set it up
//     const recoveryKey = await MatrixClientPeg.safeGet()
//         .getCrypto()!
//         .createRecoveryKeyFromPassphrase(recoveryKeySecurityPhrase);
//     const crypto = cli.getCrypto();
//
//     await crypto.bootstrapSecretStorage({
//         createSecretStorageKey: async () => recoveryKey!,
//         setupNewSecretStorage: true,
//     });
//     await crypto.bootstrapCrossSigning({
//         authUploadDeviceSigningKeys: true, //this.doBootstrapUIAuth,
//         setupNewCrossSigning: true,
//     });
//
//     cacheSecretStorageKey(keyId, keyInfo, key);
//     return [keyId, key];
// }
// //RJM Temporary Change End

/*

function setupNewCryptoKeys({recoveryKeySecurityPhrase}) {
    console.log('RJM setupNewCryptoKeys NI', recoveryKeySecurityPhrase);
    // SecurityManager -> doAccessSecretStorage
    // with opts forceReset has the code to manually do this
}

async function isPassphraseValid({recoveryKeySecurityPhrase, key, keyInfo}) {
      return MatrixClientPeg.safeGet().secretStorage.checkKey(key, keyInfo);
}

async function setupCryptoWithExistingKeys({recoveryKeySecurityPhrase, keyInfo, keyId}) {
    const keyForCheckingPassphrase = await deriveRecoveryKeyFromPassphrase(recoveryKeySecurityPhrase, keyInfo.passphrase.salt, keyInfo.passphrase.iterations);
    const cli = MatrixClientPeg.safeGet();
    const crypto = cli.getCrypto();

    console.log('RJM keyForCheckingPassphrase', keyForCheckingPassphrase)
    const key = await crypto.createRecoveryKeyFromPassphrase(recoveryKeySecurityPhrase);
    console.log('RJM key', key)

    await withSecretStorageKeyCache(async () => {
        console.log('RJM setupCryptoWithExistingKeys bootstrapSecretStorage')
        await crypto.bootstrapSecretStorage({
            createSecretStorageKey: async () => key,
            setupNewSecretStorage: true,
        });
        console.log('RJM setupCryptoWithExistingKeys bootstrapCrossSigning')
        await crypto.bootstrapCrossSigning({
            authUploadDeviceSigningKeys: this.doBootstrapUIAuth,
            setupNewCrossSigning: true,
        });
        console.log('RJM setupCryptoWithExistingKeys resetKeyBackup')
        await crypto.resetKeyBackup();
    })
}
*/
