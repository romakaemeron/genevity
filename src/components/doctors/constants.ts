export interface DoctorPhoto {
  card: string;
  modal: string;
  cardPosition: string;
  modalPosition: string;
}

export const DOCTOR_PHOTOS: Record<number, DoctorPhoto> = {
  0: {
    card: "/doctors/belyanushkin.webp",
    modal: "/doctors/belyanushkin-hq.webp",
    cardPosition: "50.0% 10.0%",
    modalPosition: "52.5% 4.9%",
  },
  1: {
    card: "/doctors/sepkina.webp",
    modal: "/doctors/sepkina-hq.webp",
    cardPosition: "50.6% 10.9%",
    modalPosition: "53.3% 7.6%",
  },
  2: {
    card: "/doctors/makarenko.webp",
    modal: "/doctors/makarenko-hq.webp",
    cardPosition: "50.0% 15.0%",
    modalPosition: "48.8% 9.2%",
  },
  3: {
    card: "/doctors/poleshko.webp",
    modal: "/doctors/poleshko-hq.webp",
    cardPosition: "52.1% 10.0%",
    modalPosition: "52.5% 5.5%",
  },
  4: {
    card: "/doctors/lysenko.webp",
    modal: "/doctors/lysenko-hq.webp",
    cardPosition: "55.0% 21.1%",
    modalPosition: "58.4% 12.8%",
  },
  5: {
    card: "/doctors/fedorenko.webp",
    modal: "/doctors/fedorenko-hq.webp",
    cardPosition: "50.5% 17.9%",
    modalPosition: "56.7% 11.6%",
  },
  6: {
    card: "/doctors/esayanc.webp",
    modal: "/doctors/esayanc-hq.webp",
    cardPosition: "52.5% 15.2%",
    modalPosition: "51.2% 12.0%",
  },
  7: {
    card: "/doctors/kirilenko.webp",
    modal: "/doctors/kirilenko-hq.webp",
    cardPosition: "50.0% 25.0%",
    modalPosition: "52.0% 13.8%",
  },
  8: {
    card: "/doctors/minchuk.webp",
    modal: "/doctors/minchuk-hq.webp",
    cardPosition: "51.8% 28.4%",
    modalPosition: "54.8% 17.3%",
  },
  9: {
    card: "/doctors/tolstikova.webp",
    modal: "/doctors/tolstikova-hq.webp",
    cardPosition: "51.8% 32.2%",
    modalPosition: "52.7% 16.5%",
  },
  11: {
    card: "/doctors/petrenko.webp",
    modal: "/doctors/petrenko-hq.webp",
    cardPosition: "56.3% 16.8%",
    modalPosition: "54.5% 12.8%",
  },
};

export const DOCTOR_COUNT = 12;
