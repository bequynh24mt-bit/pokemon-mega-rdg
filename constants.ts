
export const SPRITE_BASE = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/";

export const POKEMON_DB = {
  starters: [
    { id: 4, name: 'Charmander', type: 'Fire', maxHp: 39, atk: 52, img: `${SPRITE_BASE}4.png`, 
      moves: [
        {name: 'Scratch', pwr: 40, type: 'Normal'},
        {name: 'Ember', pwr: 40, type: 'Fire'},
        {name: 'Flame Burst', pwr: 70, type: 'Fire'},
        {name: 'Fire Spin', pwr: 35, type: 'Fire'}
      ] },
    { id: 1, name: 'Bulbasaur', type: 'Grass', maxHp: 45, atk: 49, img: `${SPRITE_BASE}1.png`, 
      moves: [
        {name: 'Tackle', pwr: 40, type: 'Normal'},
        {name: 'Vine Whip', pwr: 45, type: 'Grass'},
        {name: 'Razor Leaf', pwr: 55, type: 'Grass'},
        {name: 'Seed Bomb', pwr: 80, type: 'Grass'}
      ] },
    { id: 7, name: 'Squirtle', type: 'Water', maxHp: 44, atk: 48, img: `${SPRITE_BASE}7.png`, 
      moves: [
        {name: 'Tackle', pwr: 40, type: 'Normal'},
        {name: 'Water Gun', pwr: 40, type: 'Water'},
        {name: 'Bubble Beam', pwr: 65, type: 'Water'},
        {name: 'Bite', pwr: 60, type: 'Dark'}
      ] }
  ],
  wild: [
    { id: 4, name: 'Charmander', type: 'Fire', maxHp: 39, atk: 52, img: `${SPRITE_BASE}4.png`, 
      moves: [
        {name: 'Scratch', pwr: 40, type: 'Normal'},
        {name: 'Ember', pwr: 40, type: 'Fire'},
        {name: 'Flame Burst', pwr: 70, type: 'Fire'},
        {name: 'Fire Spin', pwr: 35, type: 'Fire'}
      ] },
    { id: 1, name: 'Bulbasaur', type: 'Grass', maxHp: 45, atk: 49, img: `${SPRITE_BASE}1.png`, 
      moves: [
        {name: 'Tackle', pwr: 40, type: 'Normal'},
        {name: 'Vine Whip', pwr: 45, type: 'Grass'},
        {name: 'Razor Leaf', pwr: 55, type: 'Grass'},
        {name: 'Seed Bomb', pwr: 80, type: 'Grass'}
      ] },
    { id: 7, name: 'Squirtle', type: 'Water', maxHp: 44, atk: 48, img: `${SPRITE_BASE}7.png`, 
      moves: [
        {name: 'Tackle', pwr: 40, type: 'Normal'},
        {name: 'Water Gun', pwr: 40, type: 'Water'},
        {name: 'Bubble Beam', pwr: 65, type: 'Water'},
        {name: 'Bite', pwr: 60, type: 'Dark'}
      ] },
    { id: 16, name: 'Pidgey', type: 'Flying', maxHp: 40, atk: 45, img: `${SPRITE_BASE}16.png`, moves: [
      {name: 'Gust', pwr: 40, type: 'Flying'},
      {name: 'Quick Attack', pwr: 40, type: 'Normal'},
      {name: 'Wing Attack', pwr: 60, type: 'Flying'},
      {name: 'Tackle', pwr: 40, type: 'Normal'}
    ] },
    { id: 19, name: 'Rattata', type: 'Normal', maxHp: 30, atk: 56, img: `${SPRITE_BASE}19.png`, moves: [
      {name: 'Tackle', pwr: 40, type: 'Normal'},
      {name: 'Bite', pwr: 60, type: 'Dark'},
      {name: 'Quick Attack', pwr: 40, type: 'Normal'},
      {name: 'Hyper Fang', pwr: 80, type: 'Normal'}
    ] },
    { id: 25, name: 'Pikachu', type: 'Electric', maxHp: 35, atk: 55, img: `${SPRITE_BASE}25.png`, moves: [
      {name: 'Thunder Shock', pwr: 40, type: 'Electric'},
      {name: 'Quick Attack', pwr: 40, type: 'Normal'},
      {name: 'Thunderbolt', pwr: 90, type: 'Electric'},
      {name: 'Electro Ball', pwr: 70, type: 'Electric'}
    ] },
    { id: 54, name: 'Psyduck', type: 'Water', maxHp: 50, atk: 52, img: `${SPRITE_BASE}54.png`, moves: [
      {name: 'Water Pulse', pwr: 60, type: 'Water'},
      {name: 'Confusion', pwr: 50, type: 'Psychic'},
      {name: 'Scratch', pwr: 40, type: 'Normal'},
      {name: 'Aqua Tail', pwr: 70, type: 'Water'}
    ] },
    { id: 129, name: 'Magikarp', type: 'Water', maxHp: 20, atk: 10, img: `${SPRITE_BASE}129.png`, moves: [
      {name: 'Splash', pwr: 0, type: 'Water'},
      {name: 'Tackle', pwr: 20, type: 'Normal'},
      {name: 'Flail', pwr: 30, type: 'Normal'},
      {name: 'Bite', pwr: 35, type: 'Dark'}
    ] },
    { id: 133, name: 'Eevee', type: 'Normal', maxHp: 55, atk: 55, img: `${SPRITE_BASE}133.png`, moves: [
      {name: 'Tackle', pwr: 40, type: 'Normal'},
      {name: 'Quick Attack', pwr: 40, type: 'Normal'},
      {name: 'Swift', pwr: 60, type: 'Normal'},
      {name: 'Bite', pwr: 60, type: 'Dark'}
    ] },
    { id: 10, name: 'Caterpie', type: 'Bug', maxHp: 45, atk: 30, img: `${SPRITE_BASE}10.png`, moves: [
      {name: 'Tackle', pwr: 40, type: 'Normal'}, {name: 'Bug Bite', pwr: 60, type: 'Bug'}, {name: 'String Shot', pwr: 10, type: 'Bug'}, {name: 'Snore', pwr: 50, type: 'Normal'}
    ] },
    { id: 13, name: 'Weedle', type: 'Bug', maxHp: 40, atk: 35, img: `${SPRITE_BASE}13.png`, moves: [
      {name: 'Poison Sting', pwr: 15, type: 'Poison'}, {name: 'Bug Bite', pwr: 60, type: 'Bug'}, {name: 'Tackle', pwr: 40, type: 'Normal'}, {name: 'Fury Cutter', pwr: 40, type: 'Bug'}
    ] },
    { id: 37, name: 'Vulpix', type: 'Fire', maxHp: 38, atk: 41, img: `${SPRITE_BASE}37.png`, moves: [
      {name: 'Ember', pwr: 40, type: 'Fire'}, {name: 'Quick Attack', pwr: 40, type: 'Normal'}, {name: 'Flame Wheel', pwr: 60, type: 'Fire'}, {name: 'Flamethrower', pwr: 90, type: 'Fire'}
    ] },
    { id: 41, name: 'Zubat', type: 'Poison', maxHp: 40, atk: 45, img: `${SPRITE_BASE}41.png`, moves: [
      {name: 'Absorb', pwr: 20, type: 'Grass'}, {name: 'Bite', pwr: 60, type: 'Dark'}, {name: 'Air Cutter', pwr: 60, type: 'Flying'}, {name: 'Wing Attack', pwr: 60, type: 'Flying'}
    ] },
    { id: 43, name: 'Oddish', type: 'Grass', maxHp: 45, atk: 50, img: `${SPRITE_BASE}43.png`, moves: [
      {name: 'Absorb', pwr: 20, type: 'Grass'}, {name: 'Acid', pwr: 40, type: 'Poison'}, {name: 'Mega Drain', pwr: 40, type: 'Grass'}, {name: 'Sludge Bomb', pwr: 90, type: 'Poison'}
    ] },
    { id: 50, name: 'Diglett', type: 'Ground', maxHp: 10, atk: 55, img: `${SPRITE_BASE}50.png`, moves: [
      {name: 'Scratch', pwr: 40, type: 'Normal'}, {name: 'Mud-Slap', pwr: 20, type: 'Ground'}, {name: 'Bulldoze', pwr: 60, type: 'Ground'}, {name: 'Earth Power', pwr: 90, type: 'Ground'}
    ] },
    { id: 52, name: 'Meowth', type: 'Normal', maxHp: 40, atk: 45, img: `${SPRITE_BASE}52.png`, moves: [
      {name: 'Scratch', pwr: 40, type: 'Normal'}, {name: 'Bite', pwr: 60, type: 'Dark'}, {name: 'Fake Out', pwr: 40, type: 'Normal'}, {name: 'Slash', pwr: 70, type: 'Normal'}
    ] },
    { id: 56, name: 'Mankey', type: 'Fighting', maxHp: 40, atk: 80, img: `${SPRITE_BASE}56.png`, moves: [
      {name: 'Scratch', pwr: 40, type: 'Normal'}, {name: 'Karate Chop', pwr: 50, type: 'Fighting'}, {name: 'Low Kick', pwr: 50, type: 'Fighting'}, {name: 'Cross Chop', pwr: 100, type: 'Fighting'}
    ] },
    { id: 58, name: 'Growlithe', type: 'Fire', maxHp: 55, atk: 70, img: `${SPRITE_BASE}58.png`, moves: [
      {name: 'Ember', pwr: 40, type: 'Fire'}, {name: 'Bite', pwr: 60, type: 'Dark'}, {name: 'Flame Wheel', pwr: 60, type: 'Fire'}, {name: 'Take Down', pwr: 90, type: 'Normal'}
    ] },
    { id: 60, name: 'Poliwag', type: 'Water', maxHp: 40, atk: 50, img: `${SPRITE_BASE}60.png`, moves: [
      {name: 'Bubble', pwr: 40, type: 'Water'}, {name: 'Water Gun', pwr: 40, type: 'Water'}, {name: 'Body Slam', pwr: 85, type: 'Normal'}, {name: 'Hydro Pump', pwr: 110, type: 'Water'}
    ] },
    { id: 63, name: 'Abra', type: 'Psychic', maxHp: 25, atk: 20, img: `${SPRITE_BASE}63.png`, moves: [
      {name: 'Confusion', pwr: 50, type: 'Psychic'}, {name: 'Psybeam', pwr: 65, type: 'Psychic'}, {name: 'Psychic', pwr: 90, type: 'Psychic'}, {name: 'Zen Headbutt', pwr: 80, type: 'Psychic'}
    ] },
    { id: 66, name: 'Machop', type: 'Fighting', maxHp: 70, atk: 80, img: `${SPRITE_BASE}66.png`, moves: [
      {name: 'Low Kick', pwr: 50, type: 'Fighting'}, {name: 'Karate Chop', pwr: 50, type: 'Fighting'}, {name: 'Seismic Toss', pwr: 60, type: 'Fighting'}, {name: 'Dynamic Punch', pwr: 100, type: 'Fighting'}
    ] },
    { id: 74, name: 'Geodude', type: 'Rock', maxHp: 40, atk: 80, img: `${SPRITE_BASE}74.png`, moves: [
      {name: 'Tackle', pwr: 40, type: 'Normal'}, {name: 'Rock Throw', pwr: 50, type: 'Rock'}, {name: 'Bulldoze', pwr: 60, type: 'Ground'}, {name: 'Stone Edge', pwr: 100, type: 'Rock'}
    ] },
    { id: 77, name: 'Ponyta', type: 'Fire', maxHp: 50, atk: 85, img: `${SPRITE_BASE}77.png`, moves: [
      {name: 'Ember', pwr: 40, type: 'Fire'}, {name: 'Flame Wheel', pwr: 60, type: 'Fire'}, {name: 'Stomp', pwr: 65, type: 'Normal'}, {name: 'Fire Blast', pwr: 110, type: 'Fire'}
    ] },
    { id: 92, name: 'Gastly', type: 'Ghost', maxHp: 30, atk: 35, img: `${SPRITE_BASE}92.png`, moves: [
      {name: 'Lick', pwr: 30, type: 'Ghost'}, {name: 'Shadow Ball', pwr: 80, type: 'Ghost'}, {name: 'Dark Pulse', pwr: 80, type: 'Dark'}, {name: 'Hex', pwr: 65, type: 'Ghost'}
    ] },
    { id: 95, name: 'Onix', type: 'Rock', maxHp: 35, atk: 45, img: `${SPRITE_BASE}95.png`, moves: [
      {name: 'Tackle', pwr: 40, type: 'Normal'}, {name: 'Rock Tomb', pwr: 60, type: 'Rock'}, {name: 'Slam', pwr: 80, type: 'Normal'}, {name: 'Dig', pwr: 80, type: 'Ground'}
    ] },
    { id: 104, name: 'Cubone', type: 'Ground', maxHp: 50, atk: 50, img: `${SPRITE_BASE}104.png`, moves: [
      {name: 'Bone Club', pwr: 65, type: 'Ground'}, {name: 'Headbutt', pwr: 70, type: 'Normal'}, {name: 'Bonemerang', pwr: 50, type: 'Ground'}, {name: 'Thrash', pwr: 120, type: 'Normal'}
    ] },
    { id: 116, name: 'Horsea', type: 'Water', maxHp: 30, atk: 40, img: `${SPRITE_BASE}116.png`, moves: [
      {name: 'Water Gun', pwr: 40, type: 'Water'}, {name: 'Bubble Beam', pwr: 65, type: 'Water'}, {name: 'Twister', pwr: 40, type: 'Dragon'}, {name: 'Hydro Pump', pwr: 110, type: 'Water'}
    ] },
    { id: 123, name: 'Scyther', type: 'Bug', maxHp: 70, atk: 110, img: `${SPRITE_BASE}123.png`, moves: [
      {name: 'Quick Attack', pwr: 40, type: 'Normal'}, {name: 'Wing Attack', pwr: 60, type: 'Flying'}, {name: 'Slash', pwr: 70, type: 'Normal'}, {name: 'X-Scissor', pwr: 80, type: 'Bug'}
    ] },
    { id: 147, name: 'Dratini', type: 'Dragon', maxHp: 41, atk: 64, img: `${SPRITE_BASE}147.png`, moves: [
      {name: 'Wrap', pwr: 15, type: 'Normal'}, {name: 'Dragon Tail', pwr: 60, type: 'Dragon'}, {name: 'Aqua Tail', pwr: 90, type: 'Water'}, {name: 'Dragon Rush', pwr: 100, type: 'Dragon'}
    ] }
  ],
  legendary: [
    { id: 150, name: 'Mewtwo', type: 'Psychic', maxHp: 106, atk: 110, img: `${SPRITE_BASE}150.png`, moves: [
      {name: 'Psychic', pwr: 90, type: 'Psychic'},
      {name: 'Swift', pwr: 60, type: 'Normal'},
      {name: 'Psystrike', pwr: 100, type: 'Psychic'},
      {name: 'Shadow Ball', pwr: 80, type: 'Ghost'}
    ], isLegendary: true },
    { id: 384, name: 'Rayquaza', type: 'Dragon', maxHp: 105, atk: 150, img: `${SPRITE_BASE}384.png`, moves: [
      {name: 'Dragon Pulse', pwr: 85, type: 'Dragon'},
      {name: 'Extreme Speed', pwr: 80, type: 'Normal'},
      {name: 'Air Slash', pwr: 75, type: 'Flying'},
      {name: 'Outrage', pwr: 95, type: 'Dragon'}
    ], isLegendary: true },
    { id: 144, name: 'Articuno', type: 'Ice', maxHp: 90, atk: 85, img: `${SPRITE_BASE}144.png`, moves: [
      {name: 'Ice Beam', pwr: 90, type: 'Ice'}, {name: 'Blizzard', pwr: 110, type: 'Ice'}, {name: 'Ancient Power', pwr: 60, type: 'Rock'}, {name: 'Hurricane', pwr: 110, type: 'Flying'}
    ], isLegendary: true },
    { id: 145, name: 'Zapdos', type: 'Electric', maxHp: 90, atk: 90, img: `${SPRITE_BASE}145.png`, moves: [
      {name: 'Thunderbolt', pwr: 90, type: 'Electric'}, {name: 'Thunder', pwr: 110, type: 'Electric'}, {name: 'Drill Peck', pwr: 80, type: 'Flying'}, {name: 'Discharge', pwr: 80, type: 'Electric'}
    ], isLegendary: true },
    { id: 146, name: 'Moltres', type: 'Fire', maxHp: 90, atk: 100, img: `${SPRITE_BASE}146.png`, moves: [
      {name: 'Flamethrower', pwr: 90, type: 'Fire'}, {name: 'Fire Blast', pwr: 110, type: 'Fire'}, {name: 'Sky Attack', pwr: 140, type: 'Flying'}, {name: 'Burn Up', pwr: 130, type: 'Fire'}
    ], isLegendary: true },
    { id: 243, name: 'Raikou', type: 'Electric', maxHp: 90, atk: 85, img: `${SPRITE_BASE}243.png`, moves: [
      {name: 'Thunder Fang', pwr: 65, type: 'Electric'}, {name: 'Discharge', pwr: 80, type: 'Electric'}, {name: 'Extrasensory', pwr: 80, type: 'Psychic'}, {name: 'Thunderbolt', pwr: 90, type: 'Electric'}
    ], isLegendary: true },
    { id: 244, name: 'Entei', type: 'Fire', maxHp: 115, atk: 115, img: `${SPRITE_BASE}244.png`, moves: [
      {name: 'Fire Fang', pwr: 65, type: 'Fire'}, {name: 'Lava Plume', pwr: 80, type: 'Fire'}, {name: 'Sacred Fire', pwr: 100, type: 'Fire'}, {name: 'Eruption', pwr: 150, type: 'Fire'}
    ], isLegendary: true },
    { id: 245, name: 'Suicune', type: 'Water', maxHp: 100, atk: 75, img: `${SPRITE_BASE}245.png`, moves: [
      {name: 'Bubble Beam', pwr: 65, type: 'Water'}, {name: 'Aurora Beam', pwr: 65, type: 'Ice'}, {name: 'Surf', pwr: 90, type: 'Water'}, {name: 'Hydro Pump', pwr: 110, type: 'Water'}
    ], isLegendary: true },
    { id: 249, name: 'Lugia', type: 'Psychic', maxHp: 106, atk: 90, img: `${SPRITE_BASE}249.png`, moves: [
      {name: 'Aeroblast', pwr: 100, type: 'Flying'}, {name: 'Psychic', pwr: 90, type: 'Psychic'}, {name: 'Ancient Power', pwr: 60, type: 'Rock'}, {name: 'Hydro Pump', pwr: 110, type: 'Water'}
    ], isLegendary: true },
    { id: 250, name: 'Ho-Oh', type: 'Fire', maxHp: 106, atk: 130, img: `${SPRITE_BASE}250.png`, moves: [
      {name: 'Sacred Fire', pwr: 100, type: 'Fire'}, {name: 'Sky Attack', pwr: 140, type: 'Flying'}, {name: 'Ancient Power', pwr: 60, type: 'Rock'}, {name: 'Brave Bird', pwr: 120, type: 'Flying'}
    ], isLegendary: true },
    { id: 382, name: 'Kyogre', type: 'Water', maxHp: 100, atk: 100, img: `${SPRITE_BASE}382.png`, moves: [
      {name: 'Water Pulse', pwr: 60, type: 'Water'}, {name: 'Ice Beam', pwr: 90, type: 'Ice'}, {name: 'Origin Pulse', pwr: 110, type: 'Water'}, {name: 'Hydro Pump', pwr: 110, type: 'Water'}
    ], isLegendary: true },
    { id: 383, name: 'Groudon', type: 'Ground', maxHp: 100, atk: 150, img: `${SPRITE_BASE}383.png`, moves: [
      {name: 'Earthquake', pwr: 100, type: 'Ground'}, {name: 'Fire Blast', pwr: 110, type: 'Fire'}, {name: 'Precipice Blades', pwr: 120, type: 'Ground'}, {name: 'Hammer Arm', pwr: 100, type: 'Fighting'}
    ], isLegendary: true }
  ]
};

export const MAP_DATA = [
  [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
  [2, 1, 1, 1, 2, 2, 3, 0, 0, 0, 0, 0, 1, 1, 2],
  [2, 1, 1, 1, 2, 0, 0, 0, 2, 2, 2, 0, 1, 1, 2],
  [2, 0, 0, 0, 0, 0, 2, 2, 2, 1, 0, 0, 0, 0, 2],
  [2, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 2],
  [2, 0, 1, 1, 1, 0, 2, 3, 2, 0, 1, 1, 1, 0, 2],
  [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
  [2, 1, 1, 2, 2, 0, 1, 1, 1, 0, 2, 2, 1, 1, 2],
  [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
];
