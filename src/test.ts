import { closeDB, connectDB, database } from "./database";
import { createClient } from "./utils";
import { defund_account } from "./wallets";

async function test_defund() {
  const KEYS = [
    "0xbe0891af8f0410f2c8aad3618cb5fcbe3d8115cd4788e6a534ee1366aaf2370c",
    "0x592edb59db2a6058171eacf026badf44608f6b2bea1913f2798d50e3a4ecf9bf",
    "0x32a34310dc55a23fee8da561c479a7874d84e816bae7a3f470678cce33db6805",
    "0x59d42938fc265b2186cb4a7e35c4aa3abf3dcfcb1ea3d058cba923ec56603101",
    "0x92647c6910da6427089bb18c9a5b0709c1343d98a8e4d1f181f1b87625e1aafb",
    "0xd78439be1f0ae9d964a97d63f2d3a06e6f287727634c25f7b3c40649d00e0821",
    "0xf16b4ef17e0a112bc7efc33f4bd24525fde6910599cd42944ccb65c72af57527",
    "0x47f046b3cecb083a54451c2d709060610dffb421ed3dbc7717d63168072aed89",
    "0x352df76a5c4f393f549a439de20b04fc68a2281a0d58d9e72489acc1d160295d",
    "0xf8f2c4bc93a3e6a907e4c9d9df5af293239bc8ab54fbb62e10c5a998babbad8f",
    "0x2cd67f1bb120f2825c5557305f3729079afec4fedd629ddfde1b978f7f67f4b5",
    "0x4cdd0a56c36fb9bc9f2ad185f4b6bbcac6ac40bf55f6dc8372748c59523cc6ac",
    "0x72d660a4c78e6bf8117528b302ce5cb8fa66e10e563f461b616b1691629a29c6",
    "0x63733306b1d1a96cf4d0d4ba119838edab6d2869c3678c63570f0703f2a280a6",
    "0xf787e796f8efee59d0f04c4395f9fa9a470f9971327afb1843f4cfaf5298a9eb",
  ];

  for (let index = 0; index < KEYS.length; index++) {
    const element = KEYS[index] as `0x${string}`;
    const client = createClient(element);
    await defund_account("0xB6076C93701D6a07266c31066B298AeC6dd65c2d", client);
  }
}

test_defund();

function createRecord() {
  const sql = "DELETE FROM transactions WHERE amount_from = 0";
  database.query(sql, (err: any, result: any) => {
    if (err) {
      console.error("Error creating record:", err);
      return;
    }
    console.log(`Record modified`);
  });
}

// connectDB();
// createRecord();
// closeDB();
