const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config');

const outBoxEventModel = sequelize.define('OutBoxEvent', {
    id : {
        type : DataTypes.UUID,
        defaultValue : DataTypes.UUIDV4,
        primaryKey : true
    },
    payload: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'sent', 'failed'),
      defaultValue: 'pending',
    },
    sent_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
    }
},{
    tableName: 'OutBoxEvents',
    timestamps: true,
})

module.exports = outBoxEventModel;
