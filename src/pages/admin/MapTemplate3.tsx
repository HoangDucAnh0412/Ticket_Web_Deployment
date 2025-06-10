import React, { useEffect, useRef, useState } from "react";

interface Area {
    templateAreaId: number;
    name: string;
    vertices: { x: number; y: number }[];
    zone: string;
    fillColor: string;
    seatNumbers?: string[];
}

interface MapTemplate {
    templateId: number;
    name: string;
    mapWidth: number;
    mapHeight: number;
    areas: Area[];
}

const mockMapTemplate: MapTemplate = {
    templateId: 2,
    name: "Stage Map",
    mapWidth: 1000,
    mapHeight: 1000,
    areas: [
        // Main outer boundary
        {
            templateAreaId: 1,
            name: "OUTER BOUNDARY",
            vertices: [
                { x: 101, y: 303.5 },
                { x: 265, y: 142 },
                { x: 496, y: 142 },
                { x: 738.5, y: 142 },
                { x: 898, y: 303.5 },
                { x: 898, y: 699.5 },
                { x: 738.5, y: 857.5 },
                { x: 494.5, y: 857.5 },
                { x: 265, y: 857.5 },
                { x: 101, y: 699.5 },
            ],
            zone: "BOUNDARY",
            fillColor: "#FFFFFF",
        },
        // Right side areas
        {
            templateAreaId: 2,
            name: "RIGHT TOP 1",
            vertices: [
                { x: 681, y: 399 },
                { x: 755, y: 372.5 },
                { x: 755, y: 444.5 },
                { x: 681, y: 444.5 },
            ],
            zone: "RIGHT",
            fillColor: "#D9D9D9",
        },
        {
            templateAreaId: 3,
            name: "RIGHT MIDDLE",
            vertices: [
                { x: 682, y: 450 },
                { x: 755, y: 450 },
                { x: 755, y: 553 },
                { x: 682, y: 553 },
            ],
            zone: "RIGHT",
            fillColor: "#D9D9D9",
        },
        {
            templateAreaId: 4,
            name: "RIGHT BOTTOM 1",
            vertices: [
                { x: 682, y: 612.821 },
                { x: 755, y: 644 },
                { x: 755, y: 557 },
                { x: 682, y: 557 },
            ],
            zone: "RIGHT",
            fillColor: "#D9D9D9",
        },
        // Left side areas (mirrored)
        {
            templateAreaId: 5,
            name: "LEFT TOP 1",
            vertices: [
                { x: 334, y: 399 },
                { x: 260, y: 372.5 },
                { x: 260, y: 444.5 },
                { x: 334, y: 444.5 },
            ],
            zone: "LEFT",
            fillColor: "#D9D9D9",
        },
        {
            templateAreaId: 6,
            name: "LEFT MIDDLE",
            vertices: [
                { x: 333, y: 450 },
                { x: 260, y: 450 },
                { x: 260, y: 553 },
                { x: 333, y: 553 },
            ],
            zone: "LEFT",
            fillColor: "#D9D9D9",
        },
        {
            templateAreaId: 7,
            name: "LEFT BOTTOM 1",
            vertices: [
                { x: 333, y: 612.821 },
                { x: 260, y: 644 },
                { x: 260, y: 557 },
                { x: 333, y: 557 },
            ],
            zone: "LEFT",
            fillColor: "#D9D9D9",
        },
        // Center stage area
        {
            templateAreaId: 8,
            name: "STAGE",
            vertices: [
                { x: 348, y: 400 },
                { x: 659, y: 400 },
                { x: 659, y: 614 },
                { x: 348, y: 614 },
            ],
            zone: "STAGE",
            fillColor: "#4B8037",
        },
        // Additional right side areas
        {
            templateAreaId: 9,
            name: "RIGHT TOP 2",
            vertices: [
                { x: 763, y: 450 },
                { x: 811, y: 450 },
                { x: 811, y: 553 },
                { x: 763, y: 553 },
            ],
            zone: "RIGHT",
            fillColor: "#D9D9D9",
        },
        {
            templateAreaId: 10,
            name: "RIGHT TOP 3",
            vertices: [
                { x: 823, y: 448 },
                { x: 891, y: 448 },
                { x: 891, y: 566 },
                { x: 823, y: 566 },
            ],
            zone: "RIGHT",
            fillColor: "#D9D9D9",
        },
        {
            templateAreaId: 11,
            name: "RIGHT BOTTOM 2",
            vertices: [
                { x: 823, y: 569 },
                { x: 891, y: 569 },
                { x: 891, y: 700 },
                { x: 823, y: 671 },
            ],
            zone: "RIGHT",
            fillColor: "#D9D9D9",
        },
        {
            templateAreaId: 12,
            name: "RIGHT BOTTOM 3",
            vertices: [
                { x: 763, y: 557 },
                { x: 811, y: 557 },
                { x: 811, y: 656 },
                { x: 788.732, y: 656 },
                { x: 763, y: 645 },
            ],
            zone: "RIGHT",
            fillColor: "#D9D9D9",
        },
        {
            templateAreaId: 13,
            name: "RIGHT TOP 4",
            vertices: [
                { x: 763, y: 445 },
                { x: 811, y: 445 },
                { x: 811, y: 349 },
                { x: 804, y: 349 },
                { x: 763, y: 367.5 },
            ],
            zone: "RIGHT",
            fillColor: "#D9D9D9",
        },
        {
            templateAreaId: 14,
            name: "RIGHT TOP 5",
            vertices: [
                { x: 823, y: 443 },
                { x: 890.5, y: 443 },
                { x: 890.5, y: 315 },
                { x: 823, y: 343.5 },
            ],
            zone: "RIGHT",
            fillColor: "#D9D9D9",
        },
        // Additional left side areas (mirrored)
        {
            templateAreaId: 15,
            name: "LEFT TOP 2",
            vertices: [
                { x: 252, y: 450 },
                { x: 204, y: 450 },
                { x: 204, y: 553 },
                { x: 252, y: 553 },
            ],
            zone: "LEFT",
            fillColor: "#D9D9D9",
        },
        {
            templateAreaId: 16,
            name: "LEFT TOP 3",
            vertices: [
                { x: 192, y: 448 },
                { x: 124, y: 448 },
                { x: 124, y: 566 },
                { x: 192, y: 566 },
            ],
            zone: "LEFT",
            fillColor: "#D9D9D9",
        },
        {
            templateAreaId: 17,
            name: "LEFT BOTTOM 2",
            vertices: [
                { x: 192, y: 569 },
                { x: 124, y: 569 },
                { x: 124, y: 700 },
                { x: 192, y: 671 },
            ],
            zone: "LEFT",
            fillColor: "#D9D9D9",
        },
        {
            templateAreaId: 18,
            name: "LEFT BOTTOM 3",
            vertices: [
                { x: 252, y: 557 },
                { x: 204, y: 557 },
                { x: 204, y: 656 },
                { x: 226.268, y: 656 },
                { x: 252, y: 645 },
            ],
            zone: "LEFT",
            fillColor: "#D9D9D9",
        },
        {
            templateAreaId: 19,
            name: "LEFT TOP 4",
            vertices: [
                { x: 252, y: 445 },
                { x: 204, y: 445 },
                { x: 204, y: 349 },
                { x: 211, y: 349 },
                { x: 252, y: 367.5 },
            ],
            zone: "LEFT",
            fillColor: "#D9D9D9",
        },
        {
            templateAreaId: 20,
            name: "LEFT TOP 5",
            vertices: [
                { x: 192, y: 443 },
                { x: 124.5, y: 443 },
                { x: 124.5, y: 315 },
                { x: 192, y: 343.5 },
            ],
            zone: "LEFT",
            fillColor: "#D9D9D9",
        },
        // Additional decorative areas
        {
            templateAreaId: 21,
            name: "RIGHT DECOR 1",
            vertices: [
                { x: 683.5, y: 360.5 },
                { x: 715.5, y: 329.5 },
                { x: 752.5, y: 368 },
                { x: 680, y: 397.5 },
                { x: 672, y: 389 },
            ],
            zone: "RIGHT",
            fillColor: "#D9D9D9",
        },
        {
            templateAreaId: 22,
            name: "RIGHT DECOR 2",
            vertices: [
                { x: 684, y: 299 },
                { x: 711, y: 326.5 },
                { x: 680, y: 359 },
                { x: 669, y: 386 },
                { x: 664, y: 382 },
                { x: 675, y: 354.5 },
                { x: 666.5, y: 343 },
            ],
            zone: "RIGHT",
            fillColor: "#D9D9D9",
        },
        {
            templateAreaId: 23,
            name: "RIGHT DECOR 3",
            vertices: [
                { x: 683, y: 715 },
                { x: 717, y: 682.5 },
                { x: 687, y: 652.5 },
                { x: 668, y: 628 },
                { x: 663, y: 632 },
                { x: 674, y: 659.5 },
                { x: 665.5, y: 671 },
            ],
            zone: "RIGHT",
            fillColor: "#D9D9D9",
        },
        {
            templateAreaId: 24,
            name: "RIGHT DECOR 4",
            vertices: [
                { x: 697, y: 269 },
                { x: 736.5, y: 309 },
                { x: 721, y: 324 },
                { x: 687.5, y: 290.5 },
            ],
            zone: "RIGHT",
            fillColor: "#D9D9D9",
        },
        {
            templateAreaId: 25,
            name: "RIGHT DECOR 5",
            vertices: [
                { x: 761, y: 650.5 },
                { x: 725, y: 685 },
                { x: 740.5, y: 700 },
                { x: 782, y: 660 },
            ],
            zone: "RIGHT",
            fillColor: "#D9D9D9",
        },
        {
            templateAreaId: 26,
            name: "RIGHT DECOR 6",
            vertices: [
                { x: 697.5, y: 743 },
                { x: 737, y: 703 },
                { x: 721.5, y: 688 },
                { x: 688, y: 721.5 },
            ],
            zone: "RIGHT",
            fillColor: "#D9D9D9",
        },
        {
            templateAreaId: 27,
            name: "RIGHT DECOR 7",
            vertices: [
                { x: 724, y: 327.5 },
                { x: 739.5, y: 311 },
                { x: 783.5, y: 354.5 },
                { x: 761.5, y: 363.5 },
            ],
            zone: "RIGHT",
            fillColor: "#D9D9D9",
        },
        {
            templateAreaId: 28,
            name: "RIGHT DECOR 8",
            vertices: [
                { x: 726, y: 199.5 },
                { x: 755, y: 229.5 },
                { x: 744.5, y: 241.5 },
                { x: 733, y: 231.5 },
                { x: 722.5, y: 241.5 },
                { x: 712.5, y: 231.5 },
            ],
            zone: "RIGHT",
            fillColor: "#D9D9D9",
        },
        {
            templateAreaId: 29,
            name: "RIGHT DECOR 9",
            vertices: [
                { x: 760, y: 233.5 },
                { x: 817, y: 292 },
                { x: 795.5, y: 313.5 },
                { x: 737.5, y: 254 },
            ],
            zone: "RIGHT",
            fillColor: "#D9D9D9",
        },
        {
            templateAreaId: 30,
            name: "RIGHT DECOR 10",
            vertices: [
                { x: 794, y: 700 },
                { x: 737, y: 758.5 },
                { x: 758.5, y: 780 },
                { x: 816.5, y: 720.5 },
            ],
            zone: "RIGHT",
            fillColor: "#D9D9D9",
        },
        {
            templateAreaId: 31,
            name: "RIGHT DECOR 11",
            vertices: [
                { x: 799, y: 316.5 },
                { x: 821, y: 295.5 },
                { x: 852, y: 325.5 },
                { x: 821, y: 338.5 },
            ],
            zone: "RIGHT",
            fillColor: "#D9D9D9",
        },
        {
            templateAreaId: 32,
            name: "RIGHT DECOR 12",
            vertices: [
                { x: 756, y: 783 },
                { x: 734, y: 762 },
                { x: 712.5, y: 783 },
                { x: 725.5, y: 814.5 },
            ],
            zone: "RIGHT",
            fillColor: "#D9D9D9",
        },
        {
            templateAreaId: 33,
            name: "RIGHT DECOR 13",
            vertices: [
                { x: 811.5, y: 684.5 },
                { x: 821.5, y: 694.5 },
                { x: 808.5, y: 707 },
                { x: 821.5, y: 718.952 },
                { x: 852.5, y: 688.952 },
                { x: 821.5, y: 675.952 },
            ],
            zone: "RIGHT",
            fillColor: "#D9D9D9",
        },
        // Left side decorative areas (mirrored)
        {
            templateAreaId: 34,
            name: "LEFT DECOR 1",
            vertices: [
                { x: 326.5, y: 654 },
                { x: 294.5, y: 685 },
                { x: 257.5, y: 646.5 },
                { x: 330, y: 617 },
                { x: 338, y: 625.5 },
            ],
            zone: "LEFT",
            fillColor: "#D9D9D9",
        },
        {
            templateAreaId: 35,
            name: "LEFT DECOR 2",
            vertices: [
                { x: 326, y: 715.5 },
                { x: 299, y: 688 },
                { x: 330, y: 655.5 },
                { x: 341, y: 628.5 },
                { x: 346, y: 632.5 },
                { x: 335, y: 660 },
                { x: 343.5, y: 671.5 },
            ],
            zone: "LEFT",
            fillColor: "#D9D9D9",
        },
        {
            templateAreaId: 36,
            name: "LEFT DECOR 3",
            vertices: [
                { x: 313, y: 745.5 },
                { x: 273.5, y: 705.5 },
                { x: 289, y: 690.5 },
                { x: 322.5, y: 724 },
            ],
            zone: "LEFT",
            fillColor: "#D9D9D9",
        },
        {
            templateAreaId: 37,
            name: "LEFT DECOR 4",
            vertices: [
                { x: 286, y: 687 },
                { x: 270.5, y: 703.5 },
                { x: 226.5, y: 660 },
                { x: 248.5, y: 651 },
            ],
            zone: "LEFT",
            fillColor: "#D9D9D9",
        },
        {
            templateAreaId: 38,
            name: "LEFT DECOR 5",
            vertices: [
                { x: 284, y: 815 },
                { x: 255, y: 785 },
                { x: 265.5, y: 773 },
                { x: 277, y: 783 },
                { x: 287.5, y: 773 },
                { x: 297.5, y: 783 },
            ],
            zone: "LEFT",
            fillColor: "#D9D9D9",
        },
        {
            templateAreaId: 39,
            name: "LEFT DECOR 6",
            vertices: [
                { x: 250, y: 781 },
                { x: 193, y: 722.5 },
                { x: 214.5, y: 701 },
                { x: 272.5, y: 760.5 },
            ],
            zone: "LEFT",
            fillColor: "#D9D9D9",
        },
        {
            templateAreaId: 40,
            name: "LEFT DECOR 7",
            vertices: [
                { x: 211, y: 698 },
                { x: 189, y: 719 },
                { x: 158, y: 689 },
                { x: 189, y: 676 },
            ],
            zone: "LEFT",
            fillColor: "#D9D9D9",
        },
        {
            templateAreaId: 41,
            name: "LEFT DECOR 8",
            vertices: [
                { x: 680, y: 617.5 },
                { x: 752, y: 647 },
                { x: 720.5, y: 680 },
                { x: 670.5, y: 627 },
            ],
            zone: "LEFT",
            fillColor: "#D9D9D9",
        },
        {
            templateAreaId: 42,
            name: "LEFT DECOR 9",
            vertices: [
                { x: 260.5, y: 368.5 },
                { x: 293, y: 334.5 },
                { x: 323, y: 364.5 },
                { x: 347.5, y: 383.5 },
                { x: 343.5, y: 388.5 },
                { x: 316, y: 377.5 },
                { x: 304.5, y: 386 },
            ],
            zone: "LEFT",
            fillColor: "#D9D9D9",
        },
        {
            templateAreaId: 43,
            name: "LEFT DECOR 10",
            vertices: [
                { x: 325, y: 290.5 },
                { x: 290.5, y: 326.5 },
                { x: 275.5, y: 311 },
                { x: 315.5, y: 269.5 },
            ],
            zone: "LEFT",
            fillColor: "#D9D9D9",
        },
        {
            templateAreaId: 44,
            name: "LEFT DECOR 11",
            vertices: [
                { x: 232.5, y: 354 },
                { x: 272.5, y: 314.5 },
                { x: 287.5, y: 330 },
                { x: 254, y: 363.5 },
            ],
            zone: "LEFT",
            fillColor: "#D9D9D9",
        },
        {
            templateAreaId: 45,
            name: "LEFT DECOR 12",
            vertices: [
                { x: 275.5, y: 257.5 },
                { x: 217, y: 314.5 },
                { x: 195.5, y: 293 },
                { x: 255, y: 235 },
            ],
            zone: "LEFT",
            fillColor: "#D9D9D9",
        },
        {
            templateAreaId: 46,
            name: "LEFT DECOR 13",
            vertices: [
                { x: 192.5, y: 295.5 },
                { x: 213.5, y: 317.5 },
                { x: 192.5, y: 339 },
                { x: 161, y: 326 },
            ],
            zone: "LEFT",
            fillColor: "#D9D9D9",
        },
        {
            templateAreaId: 47,
            name: "LEFT DECOR 14",
            vertices: [
                { x: 291, y: 240 },
                { x: 281, y: 230 },
                { x: 268.5, y: 243 },
                { x: 256.549, y: 230 },
                { x: 286.549, y: 199 },
                { x: 299.549, y: 230 },
            ],
            zone: "LEFT",
            fillColor: "#D9D9D9",
        },
        {
            templateAreaId: 48,
            name: "LEFT DECOR 15",
            vertices: [
                { x: 358, y: 371.5 },
                { x: 328.5, y: 299.5 },
                { x: 295.5, y: 331 },
                { x: 348.5, y: 381 },
            ],
            zone: "LEFT",
            fillColor: "#D9D9D9",
        },
        // Center areas
        {
            templateAreaId: 49,
            name: "CENTER LEFT",
            vertices: [
                { x: 368, y: 624.5 },
                { x: 453, y: 624.5 },
                { x: 453, y: 694 },
                { x: 353, y: 694 },
                { x: 353, y: 687.5 },
                { x: 343.5, y: 687.5 },
            ],
            zone: "CENTER",
            fillColor: "#D9D9D9",
        },
        {
            templateAreaId: 50,
            name: "CENTER MIDDLE",
            vertices: [
                { x: 458, y: 638.8 },
                { x: 464.5, y: 638.8 },
                { x: 464.5, y: 625 },
                { x: 483, y: 625 },
                { x: 483, y: 638.8 },
                { x: 487.5, y: 638.8 },
                { x: 487.5, y: 625 },
                { x: 529.5, y: 625 },
                { x: 529.5, y: 638.8 },
                { x: 534.5, y: 638.8 },
                { x: 534.5, y: 625 },
                { x: 552.5, y: 625 },
                { x: 552.5, y: 638.8 },
                { x: 559, y: 638.8 },
                { x: 559, y: 694 },
                { x: 458, y: 694 },
            ],
            zone: "CENTER",
            fillColor: "#D9D9D9",
        },
        {
            templateAreaId: 51,
            name: "CENTER RIGHT",
            vertices: [
                { x: 564, y: 625 },
                { x: 643, y: 625 },
                { x: 669.5, y: 688.5 },
                { x: 664, y: 688.5 },
                { x: 664, y: 694 },
                { x: 564, y: 694 },
            ],
            zone: "CENTER",
            fillColor: "#D9D9D9",
        },
        {
            templateAreaId: 52,
            name: "CENTER BOTTOM LEFT",
            vertices: [
                { x: 349, y: 705 },
                { x: 453, y: 705 },
                { x: 453, y: 778 },
                { x: 359, y: 777 },
                { x: 359, y: 764 },
                { x: 344, y: 764 },
                { x: 344, y: 744.5 },
                { x: 320.5, y: 744.5 },
                { x: 329, y: 722 },
                { x: 335.5, y: 722 },
            ],
            zone: "CENTER",
            fillColor: "#D9D9D9",
        },
        {
            templateAreaId: 53,
            name: "CENTER BOTTOM RIGHT",
            vertices: [
                { x: 666.392, y: 705 },
                { x: 562, y: 705 },
                { x: 563.004, y: 778 },
                { x: 695, y: 778 },
                { x: 695, y: 746.489 },
                { x: 686.468, y: 722.856 },
                { x: 679.943, y: 722.856 },
            ],
            zone: "CENTER",
            fillColor: "#D9D9D9",
        },
        {
            templateAreaId: 54,
            name: "CENTER BOTTOM MIDDLE",
            vertices: [
                { x: 459, y: 722 },
                { x: 559, y: 722 },
                { x: 559, y: 778 },
                { x: 459, y: 778 },
            ],
            zone: "CENTER",
            fillColor: "#D9D9D9",
        },
        {
            templateAreaId: 55,
            name: "CENTER BOTTOM",
            vertices: [
                { x: 445, y: 784 },
                { x: 568, y: 784 },
                { x: 568, y: 853.5 },
                { x: 530, y: 853.5 },
                { x: 530, y: 845.5 },
                { x: 507, y: 845.5 },
                { x: 482.5, y: 845.5 },
                { x: 482.5, y: 852 },
                { x: 445, y: 852 },
            ],
            zone: "CENTER",
            fillColor: "#D9D9D9",
        },
        {
            templateAreaId: 56,
            name: "CENTER BOTTOM LEFT 2",
            vertices: [
                { x: 302, y: 786 },
                { x: 442, y: 786 },
                { x: 442, y: 854 },
                { x: 275, y: 854 },
            ],
            zone: "CENTER",
            fillColor: "#D9D9D9",
        },
        {
            templateAreaId: 57,
            name: "CENTER BOTTOM RIGHT 2",
            vertices: [
                { x: 574, y: 786 },
                { x: 707, y: 786 },
                { x: 737, y: 854 },
                { x: 574, y: 854 },
            ],
            zone: "CENTER",
            fillColor: "#D9D9D9",
        },
        // Top areas
        {
            templateAreaId: 58,
            name: "TOP RIGHT",
            vertices: [
                { x: 644, y: 389.5 },
                { x: 559, y: 389.5 },
                { x: 559, y: 320 },
                { x: 659, y: 320 },
                { x: 659, y: 326.5 },
                { x: 668.5, y: 326.5 },
            ],
            zone: "TOP",
            fillColor: "#D9D9D9",
        },
        {
            templateAreaId: 59,
            name: "TOP MIDDLE",
            vertices: [
                { x: 554, y: 375.2 },
                { x: 547.5, y: 375.2 },
                { x: 547.5, y: 389 },
                { x: 529, y: 389 },
                { x: 529, y: 375.2 },
                { x: 524.5, y: 375.2 },
                { x: 524.5, y: 389 },
                { x: 482.5, y: 389 },
                { x: 482.5, y: 375.2 },
                { x: 477.5, y: 375.2 },
                { x: 477.5, y: 389 },
                { x: 459.5, y: 389 },
                { x: 459.5, y: 375.2 },
                { x: 453, y: 375.2 },
                { x: 453, y: 320 },
                { x: 554, y: 320 },
            ],
            zone: "TOP",
            fillColor: "#D9D9D9",
        },
        {
            templateAreaId: 60,
            name: "TOP LEFT",
            vertices: [
                { x: 448, y: 389 },
                { x: 369, y: 389 },
                { x: 342.5, y: 325.5 },
                { x: 348, y: 325.5 },
                { x: 348, y: 320 },
                { x: 448, y: 320 },
            ],
            zone: "TOP",
            fillColor: "#D9D9D9",
        },
        {
            templateAreaId: 61,
            name: "TOP LEFT 2",
            vertices: [
                { x: 344.5, y: 238 },
                { x: 448.5, y: 238 },
                { x: 448.5, y: 311 },
                { x: 354.5, y: 310 },
                { x: 354.5, y: 297 },
                { x: 339.5, y: 297 },
                { x: 339.5, y: 277.5 },
                { x: 316, y: 277.5 },
                { x: 324.5, y: 255 },
                { x: 331, y: 255 },
            ],
            zone: "TOP",
            fillColor: "#D9D9D9",
        },
        {
            templateAreaId: 62,
            name: "TOP RIGHT 2",
            vertices: [
                { x: 659.392, y: 309 },
                { x: 555, y: 309 },
                { x: 556.004, y: 236 },
                { x: 688, y: 236 },
                { x: 688, y: 267.511 },
                { x: 679.468, y: 291.144 },
                { x: 672.943, y: 291.144 },
            ],
            zone: "TOP",
            fillColor: "#D9D9D9",
        },
        {
            templateAreaId: 63,
            name: "TOP MIDDLE 2",
            vertices: [
                { x: 453, y: 236 },
                { x: 553, y: 236 },
                { x: 553, y: 292 },
                { x: 453, y: 292 },
            ],
            zone: "TOP",
            fillColor: "#D9D9D9",
        },
        {
            templateAreaId: 64,
            name: "TOP LEFT 3",
            vertices: [
                { x: 567, y: 230 },
                { x: 444, y: 230 },
                { x: 444, y: 160.5 },
                { x: 482, y: 160.5 },
                { x: 482, y: 168.5 },
                { x: 505, y: 168.5 },
                { x: 529.5, y: 168.5 },
                { x: 529.5, y: 162 },
                { x: 567, y: 162 },
            ],
            zone: "TOP",
            fillColor: "#D9D9D9",
        },
        {
            templateAreaId: 65,
            name: "TOP RIGHT 3",
            vertices: [
                { x: 710, y: 228 },
                { x: 570, y: 228 },
                { x: 570, y: 160 },
                { x: 737, y: 160 },
            ],
            zone: "TOP",
            fillColor: "#D9D9D9",
        },
        {
            templateAreaId: 66,
            name: "TOP LEFT 4",
            vertices: [
                { x: 438, y: 228 },
                { x: 305, y: 228 },
                { x: 275, y: 160 },
                { x: 438, y: 160 },
            ],
            zone: "TOP",
            fillColor: "#D9D9D9",
        },
        // Additional decorative areas
        {
            templateAreaId: 67,
            name: "DECOR 1",
            vertices: [
                { x: 702, y: 749 },
                { x: 787.5, y: 663 },
                { x: 811, y: 673 },
                { x: 710.5, y: 769 },
            ],
            zone: "DECOR",
            fillColor: "#D9D9D9",
        },
        {
            templateAreaId: 68,
            name: "DECOR 2",
            vertices: [
                { x: 219, y: 663 },
                { x: 305, y: 748.5 },
                { x: 295, y: 772 },
                { x: 199, y: 671.5 },
            ],
            zone: "DECOR",
            fillColor: "#D9D9D9",
        },
        {
            templateAreaId: 69,
            name: "DECOR 3",
            vertices: [
                { x: 308, y: 266 },
                { x: 222.5, y: 352 },
                { x: 199, y: 342 },
                { x: 299.5, y: 246 },
            ],
            zone: "DECOR",
            fillColor: "#D9D9D9",
        },
        {
            templateAreaId: 70,
            name: "DECOR 4",
            vertices: [
                { x: 702, y: 262 },
                { x: 787.5, y: 348 },
                { x: 811, y: 338 },
                { x: 710.5, y: 242 },
            ],
            zone: "DECOR",
            fillColor: "#D9D9D9",
        },
        // STROKE AREAS (white lines on the field)
        {
            templateAreaId: 1001,
            name: "STROKE CIRCLE",
            vertices: [
                { x: 532.3794, y: 500.5625 },
                { x: 531.7573, y: 506.8794 },
                { x: 529.9147, y: 512.9536 },
                { x: 526.9225, y: 518.5515 },
                { x: 522.8957, y: 523.4582 },
                { x: 517.989, y: 527.485 },
                { x: 512.3911, y: 530.4772 },
                { x: 506.3169, y: 532.3198 },
                { x: 500.0, y: 532.9419 },
                { x: 493.6831, y: 532.3198 },
                { x: 487.6089, y: 530.4772 },
                { x: 482.011, y: 527.485 },
                { x: 477.1043, y: 523.4582 },
                { x: 473.0775, y: 518.5515 },
                { x: 470.0853, y: 512.9536 },
                { x: 468.2427, y: 506.8794 },
                { x: 468.0, y: 500.5625 },
                { x: 468.2427, y: 494.2456 },
                { x: 470.0853, y: 488.1714 },
                { x: 473.0775, y: 482.5735 },
                { x: 477.1043, y: 477.6668 },
                { x: 482.011, y: 473.64 },
                { x: 487.6089, y: 470.6478 },
                { x: 493.6831, y: 468.8052 },
                { x: 500.0, y: 468.1831 },
                { x: 506.3169, y: 468.8052 },
                { x: 512.3911, y: 470.6478 },
                { x: 517.989, y: 473.64 },
                { x: 522.8957, y: 477.6668 },
                { x: 526.9225, y: 482.5735 },
                { x: 529.9147, y: 488.1714 },
                { x: 531.7573, y: 494.2456 },
            ],

            zone: "STROKE",
            fillColor: "transparent",
        },
        {
            templateAreaId: 1002,
            name: "STROKE PATH 1",
            vertices: [
                { x: 499.5, y: 419.5 },
                { x: 499.5, y: 594.5 },
                { x: 635.5, y: 594.5 },
                { x: 635.5, y: 569.5 },
                { x: 585.5, y: 569.5 },
                { x: 585.5, y: 444.5 },
                { x: 635.5, y: 444.5 },
                { x: 635.5, y: 419.5 },
            ],
            zone: "STROKE",
            fillColor: "transparent",
        },
        {
            templateAreaId: 1003,
            name: "STROKE PATH 2",
            vertices: [
                { x: 585.5, y: 444.5 },
                { x: 585.5, y: 569.5 },
                { x: 635.5, y: 569.5 },
                { x: 635.5, y: 537.5 },
                { x: 615.5, y: 537.5 },
                { x: 615.5, y: 478.5 },
                { x: 635.5, y: 478.5 },
                { x: 635.5, y: 444.5 },
            ],
            zone: "STROKE",
            fillColor: "transparent",
        },
        {
            templateAreaId: 1004,
            name: "STROKE PATH 3",
            vertices: [
                { x: 615.5, y: 478.5 },
                { x: 615.5, y: 537.5 },
                { x: 635.5, y: 537.5 },
                { x: 635.5, y: 478.5 },
            ],
            zone: "STROKE",
            fillColor: "transparent",
        },
        {
            templateAreaId: 1005,
            name: "STROKE PATH 4",
            vertices: [
                { x: 499.5, y: 419.5 },
                { x: 499.5, y: 594.5 },
                { x: 363.5, y: 594.5 },
                { x: 363.5, y: 569.5 },
                { x: 413.5, y: 569.5 },
                { x: 413.5, y: 444.5 },
                { x: 363.5, y: 444.5 },
                { x: 363.5, y: 419.5 },
            ],
            zone: "STROKE",
            fillColor: "transparent",
        },
        {
            templateAreaId: 1006,
            name: "STROKE PATH 5",
            vertices: [
                { x: 413.5, y: 444.5 },
                { x: 413.5, y: 569.5 },
                { x: 363.5, y: 569.5 },
                { x: 363.5, y: 537.5 },
                { x: 383.5, y: 537.5 },
                { x: 383.5, y: 478.5 },
                { x: 363.5, y: 478.5 },
                { x: 363.5, y: 444.5 },
            ],
            zone: "STROKE",
            fillColor: "transparent",
        },
        {
            templateAreaId: 1007,
            name: "STROKE PATH 6",
            vertices: [
                { x: 363.5, y: 478.5 },
                { x: 363.5, y: 537.5 },
                { x: 383.5, y: 537.5 },
                { x: 383.5, y: 478.5 },
            ],
            zone: "STROKE",
            fillColor: "transparent",
        },
    ],
};

const MapTemplate3: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const pathsRef = useRef<Map<number, Path2D>>(new Map());
    const [selectedAreaId, setSelectedAreaId] = useState<number | null>(null);
    const [scale, setScale] = useState<number>(1);
    const [offsetX, setOffsetX] = useState<number>(0);
    const [offsetY, setOffsetY] = useState<number>(0);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [startX, setStartX] = useState<number>(0);
    const [startY, setStartY] = useState<number>(0);

    const drawCanvas = (ctx: CanvasRenderingContext2D) => {
        const mapTemplate = mockMapTemplate;
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        ctx.save();
        ctx.scale(scale, scale);
        ctx.translate(offsetX, offsetY);

        // Set background to black as in the SVG
        ctx.fillStyle = "black";
        ctx.fillRect(
            0,
            0,
            mapTemplate.mapWidth / scale,
            mapTemplate.mapHeight / scale
        );

        pathsRef.current.clear();

        // Draw outer boundary first
        const outerBoundary = mapTemplate.areas.find(
            (area) => area.templateAreaId === 1
        );
        if (outerBoundary) {
            const path = new Path2D();
            path.moveTo(outerBoundary.vertices[0].x, outerBoundary.vertices[0].y);
            for (let i = 1; i < outerBoundary.vertices.length; i++) {
                path.lineTo(outerBoundary.vertices[i].x, outerBoundary.vertices[i].y);
            }
            path.closePath();
            pathsRef.current.set(outerBoundary.templateAreaId, path);

            ctx.beginPath();
            ctx.moveTo(outerBoundary.vertices[0].x, outerBoundary.vertices[0].y);
            for (let i = 1; i < outerBoundary.vertices.length; i++) {
                ctx.lineTo(outerBoundary.vertices[i].x, outerBoundary.vertices[i].y);
            }
            ctx.closePath();
            ctx.fillStyle = outerBoundary.fillColor;
            ctx.fill();
            ctx.strokeStyle = "#333333";
            ctx.lineWidth = 1 / scale;
            ctx.stroke();
        }

        // Draw other areas
        mapTemplate.areas.forEach((area) => {
            if (area.templateAreaId === 1) return; // Skip outer boundary as it's already drawn
            const path = new Path2D();
            path.moveTo(area.vertices[0].x, area.vertices[0].y);

            for (let i = 1; i < area.vertices.length; i++) {
                path.lineTo(area.vertices[i].x, area.vertices[i].y);
            }
            path.closePath();

            pathsRef.current.set(area.templateAreaId, path);

            ctx.beginPath();
            ctx.moveTo(area.vertices[0].x, area.vertices[0].y);
            for (let i = 1; i < area.vertices.length; i++) {
                ctx.lineTo(area.vertices[i].x, area.vertices[i].y);
            }
            ctx.closePath();

            if (selectedAreaId === area.templateAreaId && area.name !== "STAGE") {
                ctx.fillStyle = "#FFD700"; // Gold color for selection
            } else {
                ctx.fillStyle = area.fillColor;
            }
            ctx.fill();

            // Draw STROKE areas with white stroke only
            if (area.zone === "STROKE") {
                ctx.strokeStyle = "#FFFFFF";
                ctx.lineWidth = 2 / scale;
                ctx.stroke();
                return; // Không fill cho stroke shapes
            }

            // Add stroke for stage area
            if (area.name === "STAGE") {
                ctx.strokeStyle = "#E9B5CB";
                ctx.lineWidth =
                    selectedAreaId === area.templateAreaId ? 10 / scale : 7 / scale;
                ctx.stroke();

                // Add "STAGE" text
                ctx.save();
                ctx.fillStyle = "#E2C1D2";
                ctx.font = `${32 / scale}px Arial`;
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText("STAGE", 500, 225);
                ctx.restore();
            } else if (area.name === "CENTER BRIDGE") {
                // Special stroke for center bridge area
                ctx.strokeStyle = "#E9B5CB";
                ctx.lineWidth =
                    selectedAreaId === area.templateAreaId ? 10 / scale : 7 / scale;
                ctx.stroke();
            } else {
                // Add subtle stroke for other areas
                ctx.strokeStyle = "#333333";
                ctx.lineWidth =
                    selectedAreaId === area.templateAreaId ? 3 / scale : 1 / scale;
                ctx.stroke();
            }
        });

        ctx.restore();
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");

        if (canvas && ctx) {
            const mapTemplate = mockMapTemplate;
            canvas.width = mapTemplate.mapWidth;
            canvas.height = mapTemplate.mapHeight;

            drawCanvas(ctx);

            const handleMouseDown = (event: MouseEvent) => {
                setIsDragging(true);
                setStartX(event.clientX - offsetX * scale);
                setStartY(event.clientY - offsetY * scale);
            };

            const handleMouseMove = (event: MouseEvent) => {
                if (isDragging) {
                    const newOffsetX = (event.clientX - startX) / scale;
                    const newOffsetY = (event.clientY - startY) / scale;
                    setOffsetX(newOffsetX);
                    setOffsetY(newOffsetY);
                    drawCanvas(ctx);
                }
            };

            const handleMouseUp = () => {
                setIsDragging(false);
            };

            const handleClick = (event: MouseEvent) => {
                if (!isDragging) {
                    const rect = canvas.getBoundingClientRect();
                    const x = (event.clientX - rect.left - offsetX * scale) / scale;
                    const y = (event.clientY - rect.top - offsetY * scale) / scale;

                    for (const [areaId, path] of pathsRef.current.entries()) {
                        if (areaId === 1) continue; // Skip checking clicks on outer boundary
                        if (ctx.isPointInPath(path, x, y, "nonzero")) {
                            const area = mapTemplate.areas.find(
                                (a) => a.templateAreaId === areaId
                            );
                            if (area) {
                                alert(`Successfully clicked on ${area.name}!`);
                                setSelectedAreaId(areaId === selectedAreaId ? null : areaId);
                                drawCanvas(ctx);
                                break;
                            }
                        }
                    }
                }
            };

            canvas.addEventListener("mousedown", handleMouseDown);
            canvas.addEventListener("mousemove", handleMouseMove);
            canvas.addEventListener("mouseup", handleMouseUp);
            canvas.addEventListener("click", handleClick);

            return () => {
                canvas.removeEventListener("mousedown", handleMouseDown);
                canvas.removeEventListener("mousemove", handleMouseMove);
                canvas.removeEventListener("mouseup", handleMouseUp);
                canvas.removeEventListener("click", handleClick);
            };
        }
    }, [selectedAreaId, scale, offsetX, offsetY]);

    const handleZoomIn = () => {
        setScale((prevScale) => Math.min(prevScale + 0.1, 2));
    };

    const handleZoomOut = () => {
        setScale((prevScale) => Math.max(prevScale - 0.1, 0.5));
    };

    const handleReset = () => {
        setScale(1);
        setOffsetX(0);
        setOffsetY(0);
    };

    return (
        <div className="min-h-screen bg-gray-900 p-6 flex flex-col items-center">
            <h1 className="text-3xl font-bold text-white mb-6">
                Stage Black Pink Map
            </h1>
            <div className="flex space-x-4 mb-4">
                <button
                    onClick={handleZoomIn}
                    className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600"
                >
                    Zoom In
                </button>
                <button
                    onClick={handleZoomOut}
                    className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600"
                >
                    Zoom Out
                </button>
                <button
                    onClick={handleReset}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                    Reset
                </button>
            </div>
            <div className="bg-black p-4 rounded-lg shadow-md border border-pink-500">
                <canvas ref={canvasRef} className="border border-pink-300" />
            </div>
            <div className="mt-4 text-white text-sm">
                <p>
                    Zones: Zone A (Pink Center), Zone B (Pink Sides), Zone C (Light Pink
                    Outer)
                </p>
                <p>Total Areas: 44 (including CENTER BRIDGE connection)</p>
            </div>
        </div>
    );
};

export default MapTemplate3;
