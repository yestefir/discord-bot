

module.exports = {
    value: 'add_user_to_ticket', // Örnek Value
    type: 'USER_SELECT_MENU', // Bu önemli! (USER_SELECT_MENU adı üstünde rol üye seçimli özel menülerde bunu koyuyoruz bunada özel bir handler gelebilir.) 
    
    async execute(interaction) {
        if (!interaction.isUserSelectMenu()) return;

       
}

}
