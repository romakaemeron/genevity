export interface DoctorPhoto {
  card: string;
  modal: string;
  cardPosition: string;
  modalPosition: string;
}

/**
 * Doctor photo map — keyed by translation index.
 * `card` is a lightweight webp for scroll performance.
 * `modal` is a higher-quality version for the detail view.
 * `position` is the CSS object-position for proper face cropping.
 */
export const DOCTOR_PHOTOS: Record<number, DoctorPhoto> = {
  0: {
    card: "/doctors/belyanushkin.webp",
    modal: "/doctors/belyanushkin-hq.webp",
    cardPosition: "center 10%",
    modalPosition: "center 5%",
  },
  2: {
    card: "/doctors/makarenko.webp",
    modal: "/doctors/makarenko-hq.webp",
    cardPosition: "center 15%",
    modalPosition: "center 10%",
  },
  7: {
    card: "/doctors/kirilenko.webp",
    modal: "/doctors/kirilenko-hq.webp",
    cardPosition: "center 25%",
    modalPosition: "center 15%",
  },
};

export const DOCTOR_COUNT = 12;
