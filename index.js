const TelegramBot = require( `node-telegram-bot-api` )
const TOKEN = `1289072373:AAFZ9m4LvPcO1J2wHSlu0fp82HG3PjeUW4Y`
const gamemaster = require('./gamemaster.json')
const gamemaster_pt = require('./gamemaster_pt.json')

const options = {
    webHook: {
      port: process.env.PORT
    }
  };

const url = process.env.APP_URL || 'https://move-reminder-telegram-bot.herokuapp.com:443';
const bot = new TelegramBot(TOKEN, {polling: true})
bot.setWebHook(`${url}/bot${TOKEN}`);

const capitalize = (str, lower = false) =>
  (lower ? str.toLowerCase() : str).replace(/(?:^|\s|["'([{])+\S/g, match => match.toUpperCase());
;

var chat_id = '';

// initialize chat_id
bot.on('message', (msg) => {
    chat_id = msg.chat.id;
})

// help
bot.onText(/\/help/, (msg) => {
    const opts = {
        parse_mode: 'Markdown'
    };

    const chatId = msg.chat.id;
    const resp = `The available commands are:\n\n*/moves <pokemon>* - Get move list for the specified Pokémon.\n*/move <move name>* - Get information about the specified move.\n\n*Special filters (all used by typing pokemon\_<filter>):*\nalolan _(Alolan forms)_\ngalarian _(Galarian forms)_\nsunny, rainy, snowy _(Castform forms)_\nfrost, heat, wash, mow, fan _(Rotom forms)_\novercast, sunny _(Cherrim forms)_\n\nAll data used here comes from *pvpoke.com* - check it out!`

    bot.sendMessage(chatId, resp, opts);
});

// portuguese help
bot.onText(/\/ajuda/, (msg) => {
    const opts = {
        parse_mode: 'Markdown'
    };

    const chatId = msg.chat.id;
    const resp = `Os comandos disponíveis no idioma português são:\n\n*/golpes <nome do pokémon>* - Informações sobre os golpes do Pokémon requisitado.\n*/golpe <nome do golpe>* - Informações sobre o golpe requisitado.\n\n*Filtros especiais (usados digitando pokemon\_<filtro>):*\nalola _(formas regionais de Alola)_\ngalar _(formas regionais de Galar)_\nsol, chuva, neve _(formas do Castform)_\nfrio, calor, lavagem, corte, ventilador _(formas do Rotom)_\nnublado, sol _(formas do Cherrim)_\n\nTodos os dados utilizados vêm do *pvpoke.com* - confira o site!`

    bot.sendMessage(chatId, resp, opts);
});

// pokemon profile
bot.onText(/\/moves (.+)/, (msg, match) => {
    const opts = {
        parse_mode: 'Markdown'
    };

    const game_data_pokemons = gamemaster.pokemon;

    var pokemon = game_data_pokemons.find(pkmn => pkmn.speciesId === match[1]);

    var name = pokemon.speciesName;
    var type1 = capitalize(pokemon.types[0]);
    var type2 = pokemon.types[1] == 'none' ? '' : `/${capitalize(pokemon.types[1])}`;
    var fast_moves = capitalize(pokemon.fastMoves.join(', ').split('_').join(' ').toLowerCase());
    var charged_moves = capitalize(pokemon.chargedMoves.join(', ').split('_').join(' ').toLowerCase());
    var legacy_moves = pokemon.eliteMoves ? capitalize(pokemon.eliteMoves.join(', ').split('_').join(' ').toLowerCase()) : null;

    var pokemon_data = `*${name}*\n${type1}${type2}\n\n*Fast Moves:* ${fast_moves}\n*Charged Moves:* ${charged_moves}`
    if (legacy_moves) pokemon_data += `\n\n*Legacy Moves:* ${legacy_moves}`

    pokemon_data += `\n\n_(Data Source: pvpoke.com)_`

    const chatId = msg.chat.id;
    const resp = pokemon_data;

    bot.sendMessage(chatId, resp, opts);
});

// portuguese pokemon profile
bot.onText(/\/golpes (.+)/, (msg, match) => {
    const opts = {
        parse_mode: 'Markdown'
    };

    const game_data_pokemons = gamemaster_pt.pokemon;

    var pokemon = game_data_pokemons.find(pkmn => pkmn.speciesId === match[1]);

    var name = pokemon.speciesName;
    var type1 = capitalize(pokemon.types[0]);
    var type2 = pokemon.types[1] == 'none' ? '' : `/${capitalize(pokemon.types[1])}`;
    var fast_moves = capitalize(pokemon.fastMoves.join(', ').split('_').join(' ').toLowerCase());
    var charged_moves = capitalize(pokemon.chargedMoves.join(', ').split('_').join(' ').toLowerCase());
    var legacy_moves = pokemon.eliteMoves ? capitalize(pokemon.eliteMoves.join(', ').split('_').join(' ').toLowerCase()) : null;

    var pokemon_data = `*${name}*\n${type1}${type2}\n\n*Golpes Rápidos:* ${fast_moves}\n*Golpes Carregados:* ${charged_moves}`
    if (legacy_moves) pokemon_data += `\n\n*Golpes Legado:* ${legacy_moves}`

    pokemon_data += `\n\n_(Fonte dos Dados: pvpoke.com)_`

    const chatId = msg.chat.id;
    const resp = pokemon_data;

    bot.sendMessage(chatId, resp, opts);
});

// move info
bot.onText(/\/move (.+)/, (msg, match) => {
    const opts = {
        parse_mode: 'Markdown'
    };

    const game_data_moves = gamemaster.moves;
    var move = game_data_moves.find(move => move.name === capitalize(match[1]));

    var pokemon_move_data = '';
    var move_category = '';
    var move_cat = '';

    var move_name = move.name;
    var move_type = capitalize(move.type);
    var move_power = move.power;
    var move_energy = move.energy;
    var move_energy_gain = move.energyGain;
    var move_dpe = (move_power / move_energy).toFixed(2);
    var move_buff_attack = 0;
    var move_buff_defense = 0;
    
    if (move.buffs) {
        var move_buff_attack = move.buffs[0] > 0 ? `+${move.buffs[0]}` : move.buffs[0];
        var move_buff_defense = move.buffs[1] > 0 ? `+${move.buffs[1]}` : move.buffs[1];
        var move_buff_target = move.buffTarget;
        var move_buff_apply_chance = move.buffApplyChance * 100;
    }
    
    if (move_energy_gain > 0) {
        move_category = 'fast_move';
        move_cat = 'Fast Move';
    } else if (move_buff_attack != 0) {
        if (move_buff_defense != 0) {
            move_category = 'charged_move_dual_effect';
            move_cat = 'Charged Move';
        } else {
            move_category = 'charged_move_attack_effect'
            move_cat = 'Charged Move';
        }
    } else if (move_buff_defense != 0) {
        move_category = 'charged_move_defense_effect';
        move_cat = 'Charged Move';
    } else {
        move_category = 'charged_move_simple';
        move_cat = 'Charged Move';
    }

    pokemon_move_data = `*${move_name}* _(${move_cat})_\n*Type:* ${move_type}\n\n*Power:* ${move_power}`;

    switch(move_category) {
        case 'fast_move':
            pokemon_move_data += `\n*Energy:* ${move_energy_gain}`;
            break;
        case 'charged_move_simple':
            pokemon_move_data += `\n*Energy:* ${move_energy}\n*DPE:* ${move_dpe}`;
            break;
        case 'charged_move_attack_effect':
            pokemon_move_data += `\n*Energy:* ${move_energy}\n*DPE:* ${move_dpe}`;
            pokemon_move_data += `\n\n*Effects:*\n${move_buff_attack} Attack to ${move_buff_target} (${move_buff_apply_chance}% Chance)`;
            break;
        case 'charged_move_defense_effect':
            pokemon_move_data += `\n*Energy:* ${move_energy}\n*DPE:* ${move_dpe}`;
            pokemon_move_data += `\n\n*Effects:*\n${move_buff_defense} Defense to ${move_buff_target} (${move_buff_apply_chance}% Chance)`;
            break;
        case 'charged_move_dual_effect':
            pokemon_move_data += `\n*Energy:* ${move_energy}\n*DPE:* ${move_dpe}`;
            pokemon_move_data += `\n\n*Effects:*\n${move_buff_attack} Attack to ${move_buff_target} (${move_buff_apply_chance}% Chance)`;
            pokemon_move_data += `\n${move_buff_defense} Defense to ${move_buff_target} (${move_buff_apply_chance}% Chance)`;
            break;
    }

    pokemon_move_data += `\n\n_(Data Source: pvpoke.com)_`

    const chatId = msg.chat.id;
    var resp = pokemon_move_data;
  
    bot.sendMessage(chatId, resp, opts);
  });

// portuguese move info
bot.onText(/\/golpe (.+)/, (msg, match) => {
    const opts = {
        parse_mode: 'Markdown'
    };

    const game_data_moves = gamemaster_pt.moves;
    var move = game_data_moves.find(move => move.namePt === capitalize(match[1]));
    
    console.log(capitalize(match[1]));

    var pokemon_move_data = '';
    var move_category = '';
    var move_cat = '';

    var move_name = move.namePt;
    var move_type = capitalize(move.typePt);
    var move_power = move.power;
    var move_energy = move.energy;
    var move_energy_gain = move.energyGain;
    var move_dpe = (move_power / move_energy).toFixed(2);
    var move_buff_attack = 0;
    var move_buff_defense = 0;
    
    if (move.buffs) {
        var move_buff_attack = move.buffs[0] > 0 ? `+${move.buffs[0]}` : move.buffs[0];
        var move_buff_defense = move.buffs[1] > 0 ? `+${move.buffs[1]}` : move.buffs[1];
        var move_buff_target = move.buffTargetPt;
        var move_buff_apply_chance = move.buffApplyChance * 100;
    }
    
    if (move_energy_gain > 0) {
        move_category = 'fast_move';
        move_cat = 'Golpe Rápido';
    } else if (move_buff_attack != 0) {
        if (move_buff_defense != 0) {
            move_category = 'charged_move_dual_effect';
            move_cat = 'Golpe Carregado';
        } else {
            move_category = 'charged_move_attack_effect'
            move_cat = 'Golpe Carregado';
        }
    } else if (move_buff_defense != 0) {
        move_category = 'charged_move_defense_effect';
        move_cat = 'Golpe Carregado';
    } else {
        move_category = 'charged_move_simple';
        move_cat = 'Golpe Carregado';
    }

    pokemon_move_data = `*${move_name}* _(${move_cat})_\n*Tipo:* ${move_type}\n\n*Poder:* ${move_power}`;

    switch(move_category) {
        case 'fast_move':
            pokemon_move_data += `\n*Energia:* ${move_energy_gain}`;
            break;
        case 'charged_move_simple':
            pokemon_move_data += `\n*Energia:* ${move_energy}\n*DPE:* ${move_dpe}`;
            break;
        case 'charged_move_attack_effect':
            pokemon_move_data += `\n*Energia:* ${move_energy}\n*DPE:* ${move_dpe}`;
            pokemon_move_data += `\n\n*Efeitos:*\n${move_buff_attack} Ataque para ${move_buff_target} (${move_buff_apply_chance}% de chance)`;
            break;
        case 'charged_move_defense_effect':
            pokemon_move_data += `\n*Energia:* ${move_energy}\n*DPE:* ${move_dpe}`;
            pokemon_move_data += `\n\n*Efeitos:*\n${move_buff_defense} Defesa para ${move_buff_target} (${move_buff_apply_chance}% de chance)`;
            break;
        case 'charged_move_dual_effect':
            pokemon_move_data += `\n*Energia:* ${move_energy}\n*DPE:* ${move_dpe}`;
            pokemon_move_data += `\n\n*Efeitos:*\n${move_buff_attack} Ataque para ${move_buff_target} (${move_buff_apply_chance}% de chance)`;
            pokemon_move_data += `\n${move_buff_defense} Defesa para ${move_buff_target} (${move_buff_apply_chance}% de chance)`;
            break;
    }

    pokemon_move_data += `\n\n_(Fonte dos Dados: pvpoke.com)_`

    const chatId = msg.chat.id;
    var resp = pokemon_move_data;
  
    bot.sendMessage(chatId, resp, opts);
  });

bot.on('polling_error', (error) => {
    console.log(error)
    bot.sendMessage(chat_id, `Oops!`);
});

bot.on('webhook_error', (error) => {
    bot.sendMessage(chat_id, `Oops!`);
});