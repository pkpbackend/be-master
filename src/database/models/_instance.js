import Sequelize from 'sequelize'
import optConfig from '../../config/database'

const sequelize = new Sequelize.Sequelize(
  optConfig.database,
  optConfig.username,
  optConfig.password,
  {
    ...optConfig,
    logQueryParameters: true,
  }
)

const db = {
  sequelize,
  Sequelize,
}

export default db
