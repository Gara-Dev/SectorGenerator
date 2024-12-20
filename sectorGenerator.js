function rand(max, min) {
    return Math.floor(Math.random() * (max - (min ?? 1) + 1)) + (min ?? 1);
}

function atm(d, bonus) {
    return {
        tipo: TipoAtmosfera(),
        densità: DensitàAtmosfera(d, (bonus ?? 0)),
        opaca: AtmOpaca(),
    };
}

function atmGassous() {
    let types = ["Tossica", "Corrosiva", "Tossica e corrosiva"];
    return {
        tipo: types[rand(2, 0)],
        densità: "Pesante (2.7+ atm) Vedi “Pressioni Estreme”",
        opaca: true
    };
}

function createDwarf(type, ideale, orbita) {
    let dwarf = {
        tipo: type,
        naturalResouces: naturalResouces(),
        radioattività: radioattività(),
        peculiaritàAggiuntive: peculiaritàAggiuntive(),
        atmosfera: atm(4),
        geologia: GeologiaTerrestri()
    }
    dwarf.atmosfera.serra = AtmSerra(dwarf.atmosfera);
    dwarf.temperatura = Temp(dwarf, ideale);
    dwarf.dimensioni = generatePlanetDimensions(dwarf.tipo);
    dwarf.dimensioni.gravita = generateGravity(dwarf.dimensioni);
    dwarf.idrosfera = idrosfera(dwarf, ideale, orbita);
    dwarf.biosfera = biosfera(dwarf);
    
    return dwarf;
}

function createGas(planet) {
    planet.radioattività = radioattività();
    planet.peculiaritàAggiuntive = peculiaritàAggiuntive();
    planet.naturalResouces = naturalGasses();
    planet.temperatura = "Ghiacciata (inferiore a -70 °C), Vedi “Temperature Estreme”";
    planet.atmosfera = atmGassous();
    return planet;
}

function createTerrestrial() {
    let planet = { 
        pianeta: "Terrestre",
        anelli: rand(100) >= 15,
        radioattività: radioattività(),
        NSatellitiMaggiori: rand(2) - 1,
        SatellitiMinori: rand(6),
        peculiaritàAggiuntive: peculiaritàAggiuntive()
    };
    return planet
    }
  
function createPlanet(ideale = [-1], orbita) {
    let planet = {}
    let dice = rand(10);
    let Sdice = rand(10);
    switch (true) {
        case dice <= 4:
            planet = { pianeta: "Gassoso" };
            planet = createGas(planet);
            switch (true) {
                case Sdice <= 2:
                    planet.tipo = "Nano Gassoso";
                    planet.anelli = rand(100) <= 20;
                    planet.NSatellitiMaggiori = rand(3);
                    planet.SatellitiMinori = rand(12, 2);
                    break;
                case Sdice >= 3 && Sdice <= 6:
                    planet.tipo = "Gigante Ghiacciato";
                    planet.anelli = rand(100) <= 35;
                    planet.NSatellitiMaggiori = rand(6);
                    planet.SatellitiMinori = rand(24, 4);
                    break;
                case Sdice >= 7 && Sdice <= 10:
                    planet.tipo = "Gigante Standard";
                    planet.anelli = rand(2) == 1;
                    planet.NSatellitiMaggiori = rand(8);
                    planet.SatellitiMinori = rand(48, 6);
                    break;
            }
            break;
        case dice >= 5 && dice <= 8:
            planet = createTerrestrial();
            planet.naturalResouces = naturalResouces(); // spostare dopo biosfera per fix
            switch (true) {
                case Sdice <= 2:
                    planet.tipo = "Pianeta Ferroso";
                    planet.geologia = GeologiaTerrestri();
                    planet.atmosfera = atm(6);
                    break;
                case Sdice >= 3 && Sdice <= 7:
                    planet.tipo = "Pianeta Roccioso";
                    planet.geologia = GeologiaTerrestri();
                    planet.atmosfera = atm(6);
                    break;
                case Sdice >= 8 && Sdice <= 10:
                    planet.tipo = "Pianeta Oceanico";
                    planet.atmosfera = atm(4, 2);
                    break;
            }
            planet.atmosfera.serra = AtmSerra(planet.atmosfera);
            planet.dimensioni = generatePlanetDimensions(planet.tipo);
            break;
        case dice >= 9 && dice <= 10:
            planet = { pianeta: "Cintura di Asteroidi" };
            planet.PianetiNani = {};
            for (let f = 1; f <= rand(10); f++) {
                let type = determinateDwarfs()
                planet.PianetiNani[f] = createDwarf(type, ideale, orbita);
            }
            break;
    }
    if (planet.pianeta != "Cintura di Asteroidi") {
        planet.SatellitiMaggiori = [];
        for(let s = 0; s < planet.NSatellitiMaggiori; s++) {
            let type = determinateDwarfs();
            planet.SatellitiMaggiori[s] = createDwarf(type, ideale, orbita);
        }
        
        if(!planet.pianeta.includes("Gassoso")) {
            planet.temperatura = Temp(planet, ideale);
            if(!planet.tipo.includes("Oceanico"))
                planet.idrosfera = idrosfera(planet, ideale, orbita);
            planet.biosfera = biosfera(planet);
        }
    }
    return planet;
}

function determinateDwarfs() {
    return (rand(6) % 2 == 0) ? "Nano Roccioso" : "Nano Ghiacciato";
}

function generateGravity(dimensions) {
    return (Number)((dimensions.Massa / Math.pow(dimensions.Raggio, 2)).toFixed(2));
}

function generatePlanetDimensions(type) {
    let dimensioni = { // min - max / step
        "Nano Gassoso": {
            "Massa": rand(3, 10), // 3 - 10 / 1 
            "Raggio": (rand(20, 35)/10), // 2 - 3.5 / 0.1
        },
        "Gigante Ghiacciato": {
            "Massa": rand(3, 10), // 10 - 50 / 1
            "Raggio": (rand(20, 35)/10), // 3 - 6 / 0.1 
        },
        "Gigante Standard": {
            "Massa": rand(50, 900), // 50 - 900 / 1
            "Raggio": (rand(60, 120)/10), // 6 - 12 / 0.1
        },
        "Pianeta Ferroso": {
            "Massa": rand(1, 8)/10, // 0.1 - 0.8 / 0.1
            "Raggio": (rand(2, 5)/10), // 0.2 - 0.5 / 0.1
        },
        "Pianeta Roccioso": {
            "Massa": rand(2, 35)/10, // 0.2 - 3.5 / 0.1
            "Raggio": (rand(4, 15)/10), // 0.4 - 1.5 / 0.1
        },
        "Pianeta Oceanico": {
            "Massa": rand(12, 60)/10, // 1.2 - 6 / 0.1
            "Raggio": (rand(14, 25)/10), // 1.4 - 2.5 / 0.1
        },
        "Nano Ghiacciato": {
            "Massa": rand(1, 4)/100, // 0.01 - 0.4 / 0.1
            "Raggio": (rand(5, 30)/100), // 0.05 - 0.3 / 0.01
        },
        "Nano Roccioso": {
            "Massa": rand(5, 10)/100, // 0.05 - 1 / 0.01
            "Raggio": (rand(5, 30)/100), // 0.05 - 0.3 / 0.01
        }
    };
    return dimensioni[type];
}

function swapWithPrevious(arr, index) {
    if (index > 0 && index < arr.length) {
        [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
    }
}

function peculiaritàAggiuntive() {
    let peculiarità = [
        "Forte instabilità sismica",
        "Forti anomalie magnetiche",
        "Forti anomalie gravitazionali",
        "Atmosfera turbolenta o instabile",
        "Fenomeni atmosferici anomali e/o violenti",
        "Fenomeni geologici anomali e/o violenti",
        "Frequenti impatti meteoritici",
        "Sconvolto da un recente cataclisma naturale",
        "Segnato da un antico cataclisma naturale",
        "Cicli climatici anomali che cambiano drasticamente l'ambiente",
        "Ambiente particolarmente ricco di pericoli naturali/ambientali",
        "Ambiente particolarmente povero di pericoli naturali/ambientali"
    ]
    return peculiarità[rand(11, 0)] // d12
}

function radioattività() {
    let rad = ["Lieve", "Lieve", "Basso", "Medio", "Elevato", "Estremo"];
    return rad[rand(5, 0)] // d6
}

function findModBio(pianeta) {
    let mod = 0;

    if (pianeta.atmosfera.densità.includes("Assente"))
        mod =- 3;

    if (pianeta.temperatura.includes("Rovente") || pianeta.temperatura.includes("Ghiacciata"))
        mod =- 3;
    if (pianeta.temperatura.includes("Torrida") || pianeta.temperatura.includes("Gelida"))
        mod =- 1;

    switch (true) {
        case pianeta.atmosfera.tipo.includes("Standard"):
            mod =+ 1;
            break;
        case pianeta.atmosfera.tipo.includes("Tossica"):
        case pianeta.atmosfera.tipo.includes("Corrosiva"):
            mod =- 1;
            break;
    }
    if(!pianeta.tipo.includes("Oceanico"))
        switch (true) {
            case pianeta.idrosfera.includes("Acqua praticamente assente"):
                mod =- 3;
            case pianeta.idrosfera.includes("Grandi bacini"):
            case pianeta.idrosfera.includes("Oceani e terre emerse"):
            case pianeta.idrosfera.includes("Immensi oceani"):
            case pianeta.idrosfera.includes("Pantalassico"):
                mod =+ 2;
        }   
    else 
        mod += 2;

    if (pianeta.radioattività.includes("Elevato") || pianeta.radioattività.includes("Estremo"))
        mod =- 2;
    return mod;
}

function biosfera(pianeta) {
    let val = rand(6) + findModBio(pianeta);
    switch (true) {
        case val <= 2:
            return "Nessuna. Nessuna forma di vita";
        case val == 3:
            return "Primordiale. Forme di vita basilari, come batteri, protozoi, alghe, funghi e licheni.";
        case val == 4:
            return "Primitiva. Forme di vita vegetali diffuse, primitive forme animali come invertebrati marini e insetti.";
        case val == 5:
            return "Sviluppata. Forme di vita vegetali e animali diffuse in tutti gli ambienti, ecosistemi sviluppati."
        case val >= 6:
            return "Evoluta. Ampia varietà di specie animali e vegetali, ecosistemi articolati e grande biodiversità.";
    }
}

function findModIdro(pianeta, ideale, orbita) {
    let mod = 0;
    if (orbita < ideale[0])
        mod =- 3;
    else if (orbita >= ideale[0] && orbita <= ideale[ideale.length])
        mod =+ 1;
    else
        mod =- 2;

    switch (true) {
        case pianeta.atmosfera.densità.includes("Assente"):
            mod =- 999;
            break;
        case pianeta.atmosfera.densità.includes("Rarefatta"):
        case pianeta.atmosfera.densità.includes("Tenue"):
            mod =- 2;
            break;
        case pianeta.atmosfera.densità.includes("Densa"):
        case pianeta.atmosfera.densità.includes("Pesante"):
            mod =+ 1;
            break;
    }
    switch (true) {
        case (pianeta.temperatura).includes("Torrida"):
        case (pianeta.temperatura).includes("Gelida"):
            mod =- 3;
            break;
        case (pianeta.temperatura).includes("Rovente"):
        case (pianeta.temperatura).includes("Ghiacciata"):
            mod =- 999;
            break;
    }

    if (pianeta.tipo == "Pianeta Oceanico")
        mod += 9999;

    return mod;
}

function idrosfera(pianeta, ideale) {
    let val = rand(6) + findModIdro(pianeta, ideale);
    switch (true) {
        case val < -100:
            return "Impossibile"
        case val <= 1 && val >= -100:
            return "Acqua praticamente assente; nessun reticolo idrografico.";
        case val == 2:
            return "Secco, sporadici laghi e pozze d'acqua; reticoli idrografici poco sviluppati o soltanto stagionali.";
        case val == 3:
            return "Grandi bacini d'acqua racchiusi da terre emerse; reticoli idrografici ben sviluppati soprattutto vicino ai bacini.";
        case val == 4:
            return "Oceani e terre emerse in proporzioni più o meno bilanciate, reticoli idrografici molto ben sviluppati.;"
        case val == 5:
            return "Immensi oceani che circondano masse isolate di terre emerse; reticoli idrografici pervasivi.";
        case val >= 6:
            return "Pantalassico, intera crosta ricoperta da oceani.";
    }
}

function GeologiaTerrestri() {
    let geologia = [
        "Assenza di tettonica a placche; crosta primordiale fortemente craterizzata; sporadico vulcanesimo innescato da impatti; rara attività sismica profonda. Corpo geologicamente inattivo.",
        "Assenza di tettonica a placche; antica attività vulcanica ormai quasi cessata; attività sismica residua; crosta in parte primordiale e in parte secondaria (vulcanica). Pianeta geologicamente poco attivo in passato, quasi completamente inattivo attualmente.",
        "Assenza di tettonica a placche; grande calore interno; forte attività vulcanica e sismica; crosta secondaria di origine vulcanica periodicamente rinnovata, crosta primordiale raramente preservata. Pianeta geologicamente attivo.",
        "Antica attività tettonica; attività sismica e vulcanica residua; crosta secondaria suddivisa in placche ormai saldate, crosta primordiale raramente preservata. Pianeta con attività geologica in passato, ma ormai diminuita e avviata verso l'esaurimento.",
        "Blanda attività tettonica; crosta secondaria suddivisa in poche placche; crosta primordiale parzialmente preservata; attività sismo-vulcanica concentrata ai margini di placca. Pianeta geologicamente attivo ma poco evoluto.",
        "Sviluppata attività tettonica; crosta secondaria divisa in numerose placche, crosta primordiale raramente preservata; attività sismovulcanica soprattutto ai margini di placca; morfologia superficiale varia ed eterogenea. Pianeta geologicamente attivo ed evoluto.",
    ]
    return geologia[rand(5, 0)];
}

function naturalGasses() {
    let naturalResouces = {}
    switch (rand(6) + 2) { // Gas Comuni
        case 3:
            naturalResouces.gasComuni = "Povero";
            break;
        case 4:
        case 5:
        case 6:
            naturalResouces.gasComuni = "Mediocre";
            break;
        case 7:
            naturalResouces.gasComuni = "Abbondante";
            break;
        case 8:
            naturalResouces.gasComuni = "Ricco";
            break;

    }

    switch (rand(6)) { // Gas Rari
        case 1:
            naturalResouces.gasRari = "Scevro";
            break;
        case 2:
        case 3:
            naturalResouces.gasRari = "Povero";
            break;
        case 4:
        case 5:
        case 6:
            naturalResouces.gasRari = "Mediocre";
            break;
    }

    switch (rand(8)) { // Idrocarburi
        case 1:
            naturalResouces.idrocarburi = "Scevro";
            break;
        case 2:
        case 3:
            naturalResouces.idrocarburi = "Povero";
            break;
        case 4:
        case 5:
        case 6:
            naturalResouces.idrocarburi = "Mediocre";
            break;
        case 7:
            naturalResouces.idrocarburi = "Abbondante"
            break;
        case 8:
            naturalResouces.idrocarburi = "Ricco"
            break;
    }
    return naturalResouces;
}

function naturalResouces(biosfera) {
    let naturalResouces = naturalGasses();

    switch (rand(6) + 2) { // Minerali con elementi comuni
        case 3:
            naturalResouces.mineraliComuni = "Povero";
            break;
        case 4:
        case 5:
        case 6:
            naturalResouces.mineraliComuni = "Mediocre";
            break;
        case 7:
            naturalResouces.mineraliComuni = "Abbondante"
            break;
        case 8:
            naturalResouces.mineraliComuni = "Ricco"
            break;
    }

    switch (rand(6) + 1) { // Minerali con elementi non comuni
        case 2:
        case 3:
            naturalResouces.mineraliNonComuni = "Povero";
            break;
        case 4:
        case 5:
        case 6:
            naturalResouces.mineraliNonComuni = "Mediocre";
            break;
        case 7:
            naturalResouces.mineraliNonComuni = "Abbondante"
            break;
        case 8:
            naturalResouces.mineraliNonComuni = "Ricco"
            break;
    }

    switch (rand(6)) { // Minerali con elementi Rari
        case 1:
            naturalResouces.mineraliRari = "Scevro";
            break;
        case 2:
        case 3:
            naturalResouces.mineraliRari = "Povero";
            break;
        case 4:
        case 5:
        case 6:
            naturalResouces.mineraliRari = "Mediocre";
            break;
    }

    switch (rand(4)) { // Elementi Radioattivi
        case 1:
            naturalResouces.elementiRadioattivi = "Scevro";
            break;
        case 2:
        case 3:
            naturalResouces.elementiRadioattivi = "Povero";
            break;
        case 4:
            naturalResouces.elementiRadioattivi = "Mediocre";
    }

    switch (biosfera ? rand(8) : 0) { // Risorse ecologiche e alimentari
        case 0:
            naturalResouces.risorseEcologiche = "Nessuna";
        case 1:
            naturalResouces.risorseEcologiche = "Scevro";
            break;
        case 2:
        case 3:
            naturalResouces.risorseEcologiche = "Povero";
            break;
        case 4:
        case 5:
        case 6:
            naturalResouces.risorseEcologiche = "Mediocre";
            break;
        case 7:
            naturalResouces.risorseEcologiche = "Abbondante"
            break;
        case 8:
            naturalResouces.risorseEcologiche = "Ricco"
            break;
    }

    return naturalResouces;
}


function DensitàAtmosfera(d, bonus) {
    let densità = [
        "Assente o Tracce, Vedi “Esposizione al Vuoto”",
        "Tenue (0.1-0.5 atm) Vedi “Pressioni Estreme”",
        "Rarefatta (0.5-0.7 atm) Vedi “Atmosfere Pericolose”",
        "Normale (0.7-1.7 atm) Vivibile, nessun effetto nocivo",
        "Densa (1.7-2.7 atm) Vedi “Atmosfere Pericolose”",
        "Pesante (2.7+ atm) Vedi “Pressioni Estreme”",
    ]
    let value = rand((d), 0) + (bonus ?? 0);
    return densità[value < 6 ? value : 5];
}

function TipoAtmosfera(ideale, min) {
    let res;
    if (min)
        res = rand(10, min);
    else
        res = rand(10);

    if (ideale)
        res =- 2;
    switch (res) {
        case 1:
        case 2:
            return "Standard";
        case 3:
        case 4:
            return "Esotica";
        case 5:
            return "Tossica";
        case 6:
            return "Esotica e tossica";
        case 7:
            return "Corrosiva";
        case 8:
            return "Esotica e corrosiva";
        case 9:
            return "Tossica e corrosiva";
        case 10:
            return "Esotica, tossica e corrosiva";
    }
}

function AtmOpaca() {
    return rand(6) == 6;
}

function AtmSerra(atm) {
    let res = rand(6)
    if (atm) {
        if (atm.tipo != "Standard")
            res += 2;
        if (atm.densità.includes("Rarefatta") || atm.densità.includes("Normale") || atm.densità.includes("Densa") || atm.densità.includes("Pesante"))
            return res >= 6;
    }
    return false;
}

function Temp(pianeta, ideale) {
    let mod = 0;
    if (pianeta.orbita <= ideale)
        mod += 2;
    else
        mod -= 2;
    if(!(pianeta.pianeta && pianeta.pianeta.includes("Gassoso"))) {
        switch (true) {
            case pianeta.atmosfera.densità.includes("Assente"):
                mod -= 4;
                break;
            case pianeta.atmosfera.densità.includes("Rarefatta"):
                mod -= 2;
                break;
            case pianeta.atmosfera.densità.includes("Densa"):
            case pianeta.atmosfera.densità.includes("Pesante"):
                mod += 1;
                break;
        }
        if (pianeta.atmosfera.opaca)
            mod -= 2;
        if (pianeta.atmosfera.serra)
            mod += 2;
    }

    let res = rand(10) + mod;
    switch (true) {
        case res <= 1:
            return "Ghiacciata (inferiore a -70 °C), Vedi “Temperature Estreme”";
        case res == 2:
            return "Gelida (da -70 a -21 °C) Vedi “Temperature Estreme”";
        case res == 3 || res == 4:
            return "Rigida (da -20 a 0 °C) Vedi “Temperature Estreme”";
        case res == 5 || res == 6:
            return "Mite (da 1 a 20 °C) Nessun effetto nocivo";
        case res == 7 || res == 8:
            return "Calda (da 21 a 40 °C) Nessun effetto nocivo";
        case res == 9:
            return "Torrida (da 41 a 70 °C) Vedi “Temperature Estreme”";
        case res >= 10:
            return "Rovente (superiore a 70 °C) Vedi “Temperature Estreme”";
    }

}
function generateSector() {
    let settore = {};
    for (let i = 1; i <= 100; i++) {
        if (rand(2) == 1) {

            let result = rand(100);
            switch (true) {
                case result <= 70:
                    settore[i] = {
                        "Nstelle": 1,
                        "Numero Componenti": 1,
                        "configurazione": "A"
                    }
                    break;
                case result >= 71 && result <= 85:
                    settore[i] = {
                        "Nstelle": 2,
                        "Numero Componenti": 1,
                        "configurazione": "AB"
                    }
                    break;
                case result >= 86 && result <= 90:
                    settore[i] = {
                        "Nstelle": 2,
                        "Numero Componenti": 2,
                        "configurazione": "A-B"
                    }
                    break;
                case result >= 91 && result <= 95:
                    settore[i] = {
                        "Nstelle": 3,
                        "Numero Componenti": 2,
                        "configurazione": "AB-C"
                    }
                    break;
                case result >= 96 && result <= 98:
                    settore[i] = {
                        "Nstelle": 3,
                        "Numero Componenti": 2,
                        "configurazione": "A-BC"
                    }
                    break;
                case result >= 99 && result <= 100:
                    settore[i] = {
                        "Nstelle": 4,
                        "Numero Componenti": 2,
                        "configurazione": "AB-CD"   
                    }
                    break
            }

            let objPeculiarita = {
                2: "Portale Galattico",
                3: "Colossale Mega-Struttura di Origine Aliena Abbandoanta",
                4: "Antiche Strutture Orbitali Aliene Abbandonate",
                5: "Relitti alla Deriva e Detriti Spaziali",
                6: "Zona di Guerra",
                7: "Forte Attività Cometaria",
                8: "Coltre Cometaria Particolarmente Scarsa e Rarefatta",
                9: "Grandi Colonie Orbitali",
                10: "Infrastrutture e Installazioni Militari",
                11: "Strutture Industriali e/o Minerarie",
                12: "SpazioPorto",
                13: "Stazione di Rifornimento e Manutenzione",
                14: "Infrastrutture di Comunicazione InterStellare",
                15: "Strutture Mediche e/o di Ricerca Scientifica",
                16: "Raffinerie di Idrogeno Automatizzate",
                17: "Coltre Cometaria Molto Estesa e Ricca di Corpi Minori",
                18: "Zona in Quarantena",
                19: "Alto Rischio di Pirateria",
                20: "Attività Stellare Insolita",
                21: "Anomalie ElettroMagnetiche",
                22: "Fenomeni Psonici Sconosciuti",
                23: "Anomalie Gravitazionali",
                24: "Anomalie Temporali"
            }
            if(rand(100) % 2 == 0)
                settore[i].peculiarità = objPeculiarita[rand(12) + rand(12)];

            let stelle = [];
            let dice;
            for (let j = 1; j <= settore[i].Nstelle; j++) {
                let stella = {};
                let type = rand(100);
                switch (true) {
                    case type <= 2:
                        stella = { tipo: "subStella" };
                        dice = rand(10);
                        if (dice <= 7) {
                            stella.classe = "Nana Bruna";
                            stella.sigla = "B0";
                        }
                        else {
                            stella.classe = "ProtoStella";
                            stella.sigla = "B" + rand(6);
                        }
                        break;
                    case type >= 3 && type <= 90:
                        stella = { tipo: "Stella In Sequenza principale" };
                        dice = rand(20);
                        switch (true) {
                            case dice <= 11:
                                stella.classe = "M (Rossa)";
                                stella.sigla = "S1";
                                break;
                            case dice >= 12 && dice <= 13:
                                stella.classe = "K (Arancione)";
                                stella.sigla = "S2";
                                break;
                            case dice >= 14 && dice <= 15:
                                stella.classe = "G (Gialla)";
                                stella.sigla = "S3";
                                break;
                            case dice >= 16 && dice <= 17:
                                stella.classe = "F (Giallo-Bianca)";
                                stella.sigla = "S4";
                            case dice == 18:
                                stella.classe = "A (Bianca)";
                                stella.sigla = "S5";
                            case dice == 19:
                                stella.classe = "B (Bianco-Azzurra)";
                                stella.sigla = "S6";
                                break;
                            case dice == 20:
                                stella.classe = "O (blu)";
                                stella.sigla = "S7";
                                break;
                        }
                        break;
                    case type >= 91 && type <= 93:
                        stella = { tipo: "Stella in Post-Sequenza" };
                        dice = rand(10);
                        if (dice <= 8) {
                            stella.classe = "Gigante";
                            stella.sigla = "P5";
                        } else {
                            stella.classe = "Super Gigante";
                            stella.sigla = "P8";
                        }
                        break;
                    case type >= 94 && type <= 100:
                        stella = { tipo: "Stella Degenere" };
                        dice = rand(10);
                        switch (true) {
                            case dice <= 7:
                                stella.classe = "Nana Bianca";
                                stella.sigla = "D3";
                                break;
                            case dice >= 8 && dice <= 9:
                                stella.classe = "Stella di Neutroni";
                                stella.sigla = "D6";
                                break;
                            case dice == 10:
                                stella.classe = "Buco Nero Stellare";
                                stella.sigla = "D9";
                                break;
                        }
                        break;
                }
                const priority = {
                    "S": 4,
                    "P": 3,
                    "D": 2,
                    "B": 1,
                    "T": 0,
                }
                stelle.push(stella);
                for(let h = stelle.length-1; h > 0 ; h--) {
                    if(stelle.length > 1) {
                        if (priority[stelle[h].sigla.charAt(0)] > priority[stelle[h-1].sigla.charAt(0)]) {
                                swapWithPrevious(stelle, h);
                        } else if (priority[stelle[h].sigla.charAt(0)] == priority[stelle[h-1].sigla.charAt(0)]) {
                            if (stelle[h].sigla.charAt(1) > stelle[h-1].sigla.charAt(1)) {
                                swapWithPrevious(stelle, h);
                            }
                        }
                    }
                }
            }

            settore[i].componenti = [{}, {}];
            settore[i].componenti[0].stellaPrimaria= stelle[0];
            switch (settore[i].configurazione) {
                case "AB":
                    settore[i].componenti[0].stellaSecondaria = stelle[1]; 
                case "A":
                    settore[i].componenti.pop();
                    break;
                case "A-BC":
                    settore[i].componenti[1].stellaSecondaria= stelle[2];
                case "A-B":
                    settore[i].componenti[1].stellaPrimaria= stelle[1];
                    break;
                case "AB-CD":
                    settore[i].componenti[1].stellaSecondaria= stelle[3];
                case "AB-C":
                    settore[i].componenti[0].stellaSecondaria= stelle[1];
                    settore[i].componenti[1].stellaPrimaria= stelle[2];
                    break;
            }
           
            for (let c = 0; c < settore[i].componenti.length; c++) {    
                let sigla = settore[i].componenti[c].stellaPrimaria.sigla;
                switch (true) {
                    case sigla.charAt(0) == "B":
                        settore[i].componenti[c].orbitaMinima = 1;
                        settore[i].componenti[c].orbitaIdeale = [0];
                        settore[i].componenti[c].ostacoliSviluppoVita = "Stella troppo debole";
                        break;
                    case sigla == "S1":
                        settore[i].componenti[c].orbitaMinima = 1;
                        settore[i].componenti[c].orbitaIdeale = [2, 3];
                        settore[i].componenti[c].ostacoliSviluppoVita = "Brillamenti, Rotazione Sincrona";
                        break;
                    case sigla == "S2":
                        settore[i].componenti[c].orbitaMinima = 1;
                        settore[i].componenti[c].orbitaIdeale = [4, 5, 6];
                        settore[i].componenti[c].ostacoliSviluppoVita = "Nessuno";
                        break;
                    case sigla == "S3":
                        settore[i].componenti[c].orbitaMinima = 1;
                        settore[i].componenti[c].orbitaIdeale = [6, 7, 8];
                        settore[i].componenti[c].ostacoliSviluppoVita = "Nessuno";
                        break;
                    case sigla == "S4":
                        settore[i].componenti[c].orbitaMinima = 2;
                        settore[i].componenti[c].orbitaIdeale = [8, 9, 10];
                        settore[i].componenti[c].ostacoliSviluppoVita = "Nessuno";
                        break;
                    case sigla == "S5":
                        settore[i].componenti[c].orbitaMinima = 3;
                        settore[i].componenti[c].orbitaIdeale = [12, 13];
                        settore[i].componenti[c].ostacoliSviluppoVita = "Esistenza troppo breve";
                        break;
                    case sigla == "S6":
                        settore[i].componenti[c].orbitaMinima = 4;
                        settore[i].componenti[c].orbitaIdeale = [15, 16];
                        settore[i].componenti[c].ostacoliSviluppoVita = "Esistenza troppo breve";
                        break;
                    case sigla == "S7":
                        settore[i].componenti[c].orbitaMinima = 6;
                        settore[i].componenti[c].orbitaIdeale = [19, 20];
                        settore[i].componenti[c].ostacoliSviluppoVita = "Esistenza troppo breve";
                        break;
                    case sigla == "P5":
                        settore[i].componenti[c].orbitaMinima = 4;
                        settore[i].componenti[c].orbitaIdeale = [0];
                        settore[i].componenti[c].ostacoliSviluppoVita = "Molteplici Fattori Avversi";
                        break;
                    case sigla == "P8":
                        settore[i].componenti[c].orbitaMinima = 7;
                        settore[i].componenti[c].orbitaIdeale = [0];
                        settore[i].componenti[c].ostacoliSviluppoVita = "Molteplici Fattori Avversi";
                        break;
                    case sigla == "D3":
                        settore[i].componenti[c].orbitaMinima = 1;
                        settore[i].componenti[c].orbitaIdeale = [0];
                        settore[i].componenti[c].ostacoliSviluppoVita = "Molteplici Fattori Avversi";
                        break;
                    case sigla == "D6":
                        settore[i].componenti[c].orbitaMinima = 4;
                        settore[i].componenti[c].orbitaIdeale = [0];
                        settore[i].componenti[c].ostacoliSviluppoVita = "Molteplici Fattori Avversi";
                        break;
                    case sigla == "D9":
                        settore[i].componenti[c].orbitaMinima = 6;
                        settore[i].componenti[c].orbitaIdeale = [0];
                        settore[i].componenti[c].ostacoliSviluppoVita = "Molteplici Fattori Avversi";
                        break;

                }

                switch (true) {
                    case settore[i].Nstelle == 1 && (settore[i].componenti[c].stellaPrimaria.sigla).includes("S"):
                        settore[i].componenti[c].Npianeti = (rand(6) + rand(6));
                        break;
                    case settore[i].Nstelle == 2 && ((settore[i].componenti[c].stellaPrimaria.sigla).includes("S")):
                        settore[i].componenti[c].Npianeti = rand(8);    
                    break;
                    case settore[i].Nstelle <= 2 && (!(settore[i].componenti[c].stellaPrimaria.sigla).includes("S")):
                        settore[i].componenti[c].Npianeti = rand(6) - 1;
                        break;
                }   

                let assegnati = 0;
                settore[i].componenti[c].pianeti = [];
                for (let orbita = settore[i].componenti[c].orbitaMinima; assegnati < settore[i].componenti[c].Npianeti; orbita++) {
                    let planet;
                    if (rand(8) >= 4) {
                        assegnati++;
                        planet = createPlanet(settore[i].orbitaIdeale, orbita);
                        planet.orbita = orbita;
                        settore[i].componenti[c].pianeti.push(planet);
                    }
                }
            }
        }
    }
    const fs = require('node:fs');
    fs.writeFile('sector.json', JSON.stringify(settore, null, '\t'), err => {
    if (err) {
        console.error(err);
    } else {
        // file written successfully
    }
    });    
    
    return settore;
}

generateSector();