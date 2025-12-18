const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    uid: {
        type: Number,
        index: true,
    },
    makerCommission: { type: Number },
    takerCommission: { type: Number },
    buyerCommission: { type: Number },
    sellerCommission: { type: Number },
    commissionRates: {
        maker: { type: String },
        taker: { type: String },
        buyer: { type: String },
        seller: { type: String },
    },
    canTrade: { type: Boolean },
    canWithdraw: { type: Boolean },
    canDeposit: { type: Boolean },
    brokered: { type: Boolean },
    requireSelfTradePrevention: { type: Boolean },
    preventSor: { type: Boolean },
    updateTime: { type: Number },
    accountType: { type: String },
    permissions: [String],
    updateAt: { type: Date },
    createAt: { type: Date },
});

const account = mongoose.model('account', schema, 'account');

module.exports = account;