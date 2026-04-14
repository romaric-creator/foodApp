const User = require('./User');
const Category = require('./Category');
const Menu = require('./Menu');
const Table = require('./Table');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const ThemeSetting = require('./ThemeSetting');

// Associations
Category.hasMany(Menu, { foreignKey: 'idCat' });
Menu.belongsTo(Category, { foreignKey: 'idCat' });

User.hasMany(Order, { foreignKey: 'idUsers' });
Order.belongsTo(User, { foreignKey: 'idUsers' });

Table.hasMany(Order, { foreignKey: 'idTab' });
Order.belongsTo(Table, { foreignKey: 'idTab' });

Order.hasMany(OrderItem, { foreignKey: 'idOrder' });
OrderItem.belongsTo(Order, { foreignKey: 'idOrder' });

Menu.hasMany(OrderItem, { foreignKey: 'idMenu' });
OrderItem.belongsTo(Menu, { foreignKey: 'idMenu' });

module.exports = {
    User,
    Category,
    Menu,
    Table,
    Order,
    OrderItem,
    ThemeSetting
};
