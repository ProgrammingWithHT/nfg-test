const jwt = require("jsonwebtoken");
const { RestClientV5 } = require("bybit-api");
const User = require("../models/auth");

const client = new RestClientV5({
  testnet: true,
  key: "LZo88T6Ey4upWPMYsz",
  secret: "SR80sckqumm8x1OggOtyP7vyvn0MjcBfJodp",
});

exports.createSubMember = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Unauthorized access" });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const { email } = decoded;

    if (!email) {
      return res
        .status(400)
        .json({ error: "Email is not available from token." });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const { name, _id } = user;
    if (!name) {
      return res.status(400).json({ error: "Username is not available." });
    }
    console.log("User Name:", name);
    const bybitusername =
      name.replace(/\s+/g, "").toLowerCase().slice(0, 9) +
      _id.toString().slice(-6);
    console.log("bybitusername", bybitusername);
    const params = {
      username: bybitusername,
      memberType: 1,
      switch: 1,
      note: "test",
    };
    console.log("Parameters for createSubMember:", params);

    const response = await client.createSubMember(params);
    console.log(response);
    const { uid } = response.result;
    if (!uid) {
      return res.status(500).json({ error: "Sub UID not received." });
    }
    user.bybituid = uid;
    await user.save();
    res.status(200).json(response);
  } catch (error) {
    console.error(
      "Error: sub-member",
      error.response ? error.response.data : error.message
    );
    res.status(500).json({ error: error.message });
  }
};

// Create Sub UID API Key
exports.createSubUIDAPIKey = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Unauthorized access" });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const { email } = decoded;

    if (!email) {
      return res
        .status(400)
        .json({ error: "Email is not available from token." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const { bybituid } = user;
    if (!bybituid) {
      return res
        .status(400)
        .json({ error: "bybituid is not available for this user." });
    }
    const response = await client.createSubUIDAPIKey({
      subuid: bybituid,
      note: "test api",
      readOnly: 0,
      permissions: {
        Wallet: ["AccountTransfer"],
      },
    });
    console.log(response);
    res.status(200).json(response);
  } catch (error) {
    console.error(
      "Error: createSubUIDAPIKey",
      error.response ? error.response.data : error.message
    );
    res.status(500).json({ error: error.message });
  }
};

// Get Allowed Deposit Coin Info
exports.getAllowedDepositCoinInfo = async (req, res) => {
  try {
    const response = await client.getAllowedDepositCoinInfo();
    console.log(response);
    res.status(200).json(response);
  } catch (error) {
    console.error(
      "Error: getAllCoinsBalance",
      error.response ? error.response.data : error.message
    );
    res.status(500).json({ error: error.message });
  }
};

// Get Coin Info
exports.getCoinInfo = async (req, res) => {
  try {
    const response = await client.getCoinInfo("DOGE");
    console.log(response);
    res.status(200).json(response);
  } catch (error) {
    console.error(
      "Error: getAllCoinsBalance",
      error.response ? error.response.data : error.message
    );
    res.status(500).json({ error: error.message });
  }
};

// Get Sub Deposit Address
exports.getSubDepositAddress = async (req, res) => {
  try {
    const response = await client.getSubDepositAddress(
      "ETH",
      "ETH",
      "103758697"
    );
    console.log(response);
    res.status(200).json(response);
  } catch (error) {
    console.error(
      "Error: getSubDepositAddress",
      error.response ? error.response.data : error.message
    );
    res.status(500).json({ error: error.message });
  }
};

// Submit Withdrawal
exports.submitWithdrawal = async (req, res) => {
  try {
    const response = await client.submitWithdrawal({
      coin: "USDT",
      chain: "BEP20",
      address: "0xbaa1398e38412dcfd7850fcd4319e2338cc5a3a0",
      amount: "24",
      timestamp: Date.now(),
    });
    console.log(response);
    res.status(200).json(response);
  } catch (error) {
    console.error(
      "Error: submitWithdrawal",
      error.response ? error.response.data : error.message
    );
    res.status(500).json({ error: error.message });
  }
};
