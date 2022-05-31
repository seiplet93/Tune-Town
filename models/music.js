"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class music extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.music.belongsToMany(models.user, {
        through: "musicUsers",
      });
    }
  }
  music.init(
    {
      song: DataTypes.STRING,
      album: DataTypes.STRING,
      artist: DataTypes.STRING,
      userId: DataTypes.INTEGER,
      commentId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "music",
    }
  );
  return music;
};
