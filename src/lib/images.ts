// Photos libres de droits (licence Unsplash), à remplacer par vos propres photos.
// Aucune photo de voiture tant que les vraies photos de votre véhicule (Toyota Auris) ne sont pas ajoutées.
export type Pic = { src: string; alt: string; pos?: string };

export const PICS = {
  lille: { src: "/img/lille.webp", alt: "Grand'Place de Lille et sa grande roue, de nuit", pos: "50% 55%" },
} satisfies Record<string, Pic>;

// Photos d'une Toyota Auris bleue (modèle identique), en attendant les photos du véhicule.
export const CAR_PICS: Pic[] = [
  { src: "/img/auris-1.webp", alt: "Toyota Auris bleue (phase 2), vue de face", pos: "50% 72%" },
  { src: "/img/auris-3.webp", alt: "Habitacle de la Toyota Auris avec écran Apple CarPlay et Android Auto", pos: "50% 50%" },
  { src: "/img/auris-2.webp", alt: "Toyota Auris bleue (phase 2) garée devant une maison en briques", pos: "60% 55%" },
];

// Une photo par trajet, chacune propre au lieu ou au service (aucune photo répétée entre les cartes).
export const SERVICE_PIC: Record<string, Pic> = {
  "aeroport-lille-lesquin": { src: "/img/dest-lesquin.webp", alt: "Terminal de l'aéroport de Lille-Lesquin vu depuis la piste", pos: "50% 55%" },
  "gare-lille-flandres": { src: "/img/dest-flandres.webp", alt: "Façade de la gare de Lille-Flandres", pos: "50% 50%" },
  "gare-lille-europe": { src: "/img/svc-lille-europe.webp", alt: "Gare de Lille-Europe vue depuis le boulevard", pos: "50% 45%" },
  "lille-paris": { src: "/img/dest-paris.webp", alt: "La tour Eiffel et la Seine sous un arc-en-ciel", pos: "50% 62%" },
  "lille-bruxelles": { src: "/img/dest-bruxelles.webp", alt: "La Grand-Place de Bruxelles illuminée au crépuscule", pos: "50% 45%" },
  "aeroport-roissy-cdg": { src: "/img/dest-cdg.webp", alt: "Avions Air France sur le tarmac du terminal 2 de Paris-Charles-de-Gaulle", pos: "45% 60%" },
  mariage: { src: "/img/svc-mariage.webp", alt: "Bouquet de roses blanches de la mariée", pos: "50% 45%" },
  "mise-a-disposition": { src: "/img/lille.webp", alt: "Grand'Place de Lille et sa grande roue, de nuit", pos: "50% 55%" },
  "sorties-evenements": { src: "/img/svc-sorties.webp", alt: "Musiciens sur scène lors d'un concert de nuit", pos: "50% 50%" },
  entreprises: { src: "/img/svc-entreprises.webp", alt: "Tours du quartier d'affaires Euralille, Lille", pos: "40% 45%" },
};

export type PhotoCredit = { file: string; label: string; title: string; author: string; license: string; licenseUrl: string; source: string };

// Crédits exacts de chaque photo (Wikimedia Commons). Licences CC BY / BY-SA : auteur, licence et lien obligatoires.
export const PHOTO_CREDITS: PhotoCredit[] = [
  {
    "file": "/img/dest-lesquin.webp",
    "title": "LIL airport main terminal (3).jpg",
    "author": "Olivier Cleynen",
    "license": "CC0",
    "licenseUrl": "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
    "source": "https://commons.wikimedia.org/wiki/File:LIL_airport_main_terminal_(3).jpg",
    "label": "Aéroport de Lille-Lesquin"
  },
  {
    "file": "/img/dest-flandres.webp",
    "title": "Lille gare lille flandres facade.jpg",
    "author": "Velvet",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Lille_gare_lille_flandres_facade.jpg",
    "label": "Gare de Lille-Flandres"
  },
  {
    "file": "/img/svc-lille-europe.webp",
    "title": "Lille - Gare Lille-Europe , Tours de Lille & Lilleurope.JPG",
    "author": "JÄNNICK Jérémy",
    "license": "Public domain",
    "licenseUrl": "https://creativecommons.org/publicdomain/mark/1.0/",
    "source": "https://commons.wikimedia.org/wiki/File:Lille_-_Gare_Lille-Europe_,_Tours_de_Lille_%26_Lilleurope.JPG",
    "label": "Gare de Lille-Europe"
  },
  {
    "file": "/img/svc-entreprises.webp",
    "title": "Tour de Lille 2.jpg",
    "author": "kallerna",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Tour_de_Lille_2.jpg",
    "label": "Euralille, tours de Lille"
  },
  {
    "file": "/img/dest-zaventem.webp",
    "title": "Moving walkway through the A-gates of Brussels Airport (DSCF7310).jpg",
    "author": "Trougnouf",
    "license": "CC BY 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Moving_walkway_through_the_A-gates_of_Brussels_Airport_(DSCF7310).jpg",
    "label": "Aéroport de Bruxelles-National"
  },
  {
    "file": "/img/dest-bruxelles.webp",
    "title": "Grand Place 1-7 during civil twilight, Brussels (DSCF1982).jpg",
    "author": "Trougnouf (Benoit Brummer)",
    "license": "CC BY 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Grand_Place_1-7_during_civil_twilight,_Brussels_(DSCF1982).jpg",
    "label": "Grand-Place de Bruxelles"
  },
  {
    "file": "/img/dest-touquet.webp",
    "title": "Le Touquet-Paris-Plage - Dunes au nord de la plage (2).JPG",
    "author": "AntonyB",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
    "source": "https://commons.wikimedia.org/wiki/File:Le_Touquet-Paris-Plage_-_Dunes_au_nord_de_la_plage_(2).JPG",
    "label": "Le Touquet-Paris-Plage"
  },
  {
    "file": "/img/lille.webp",
    "title": "Lille gde roue nuit.JPG",
    "author": "Velvet",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
    "source": "https://commons.wikimedia.org/wiki/File:Lille_gde_roue_nuit.JPG",
    "label": "Grand'Place de Lille et grande roue"
  },
  {
    "file": "/img/dest-paris.webp",
    "title": "Eiffel Tower with rainbow in Paris.jpg",
    "author": "Marc Baronnet",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Eiffel_Tower_with_rainbow_in_Paris.jpg",
    "label": "Tour Eiffel et arc-en-ciel"
  },
  {
    "file": "/img/dest-cdg.webp",
    "title": "Paris Charles-de-Gaulle Airport Terminal 2F apron.jpg",
    "author": "Arne Müseler",
    "license": "CC BY-SA 3.0 de",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0/de/deed.en",
    "source": "https://commons.wikimedia.org/wiki/File:Paris_Charles-de-Gaulle_Airport_Terminal_2F_apron.jpg",
    "label": "Aéroport Paris-Charles-de-Gaulle"
  },
  {
    "file": "/img/dest-roubaix.webp",
    "title": "Hôtel Ville Roubaix 4.jpg",
    "author": "Chabe01",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:H%C3%B4tel_Ville_Roubaix_4.jpg",
    "label": "Hôtel de ville de Roubaix"
  },
  {
    "file": "/img/svc-sorties.webp",
    "title": "Musicians performing on stage at a night concert featuring vibrant lights and energetic atmosphere.jpg",
    "author": "Shixart1985",
    "license": "CC BY 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Musicians_performing_on_stage_at_a_night_concert_featuring_vibrant_lights_and_energetic_atmosphere.jpg",
    "label": "Concert"
  }
];

export const PRESS_CREDITS = [
  { label: "Toyota Auris, vue avant", owner: "Wandaloo.com", url: "https://www.wandaloo.com" },
  { label: "Toyota Auris, vue arrière", owner: "Actu-Automobile.com", url: "https://www.actu-automobile.com" },
  { label: "Habitacle (montage avec l'écran CarPlay du véhicule)", owner: "Actu-Automobile.com", url: "https://www.actu-automobile.com" },
];

export const OWN_PHOTO_CREDIT = { label: "Écran CarPlay de l'habitacle", note: "Photo du véhicule, Nord VTC." };

export const UNSPLASH_CREDIT = { label: "Mariage (bouquet de roses blanches)", source: "https://unsplash.com", license: "Licence Unsplash" };

export const CREDITS = "Photos : Wikimedia Commons (CC0, CC BY, CC BY-SA) et Unsplash, recadrées.";
