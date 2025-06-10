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
    name: "Stage Black Pink Map",
    mapWidth: 1000,
    mapHeight: 1000,
    areas: [
        // Main Stage - Center area with complex shape (from SVG path)
        {
            templateAreaId: 1,
            name: "STAGE",
            vertices: [
                { x: 686, y: 177.5 },
                { x: 686, y: 212.5 },
                { x: 714, y: 212.5 },
                { x: 714, y: 242.5 },
                { x: 599.995, y: 242.5 },
                { x: 572.495, y: 271.5 },
                { x: 516.5, y: 271.5 },
                { x: 516.5, y: 431.5 },
                { x: 557.5, y: 431.5 },
                { x: 557.5, y: 475.345 },
                { x: 446, y: 473 },
                { x: 446, y: 431.5 },
                { x: 488.5, y: 431.5 },
                { x: 488.5, y: 271.5 },
                { x: 434.562, y: 271.5 },
                { x: 408.562, y: 242.5 },
                { x: 293, y: 242.5 },
                { x: 293, y: 212.5 },
                { x: 318, y: 212.5 },
                { x: 318, y: 177.5 }
            ],
            zone: "STAGE",
            fillColor: "#000000"
        },
        // Center pink rectangles
        {
            templateAreaId: 2,
            name: "CENTER SEATING 1",
            vertices: [
                { x: 392.5, y: 312 },
                { x: 461.5, y: 312 },
                { x: 461.5, y: 411 },
                { x: 392.5, y: 411 }
            ],
            zone: "ZONE A",
            fillColor: "#F02871"
        },
        {
            templateAreaId: 3,
            name: "CENTER SEATING 2",
            vertices: [
                { x: 538.5, y: 312 },
                { x: 607.5, y: 312 },
                { x: 607.5, y: 411 },
                { x: 538.5, y: 411 }
            ],
            zone: "ZONE A",
            fillColor: "#F02871"
        },
        // Center middle sections connecting left to right
        {
            templateAreaId: 4,
            name: "LEFT CENTER 1",
            vertices: [
                { x: 198.5, y: 383 },
                { x: 293.484, y: 396.5 },
                { x: 292, y: 418.5 },
                { x: 293.484, y: 444 },
                { x: 198.5, y: 454 },
                { x: 197, y: 418.5 }
            ],
            zone: "ZONE B",
            fillColor: "#F02871"
        },
        {
            templateAreaId: 5,
            name: "RIGHT CENTER 1",
            vertices: [
                { x: 801.484, y: 383 },
                { x: 706.5, y: 396.5 },
                { x: 707.984, y: 418.5 },
                { x: 706.5, y: 444 },
                { x: 801.484, y: 454 },
                { x: 802.984, y: 418.5 }
            ],
            zone: "ZONE B",
            fillColor: "#F02871"
        },
        {
            templateAreaId: 6,
            name: "LEFT CENTER 2",
            vertices: [
                { x: 200, y: 462.5 },
                { x: 294.5, y: 448.5 },
                { x: 298, y: 470.5 },
                { x: 307.5, y: 495.5 },
                { x: 217.5, y: 532.5 },
                { x: 207, y: 499.5 }
            ],
            zone: "ZONE B",
            fillColor: "#F02871"
        },
        {
            templateAreaId: 7,
            name: "RIGHT CENTER 2",
            vertices: [
                { x: 800, y: 462 },
                { x: 705.5, y: 448 },
                { x: 702, y: 470 },
                { x: 692.5, y: 495 },
                { x: 782.5, y: 532 },
                { x: 793, y: 499 }
            ],
            zone: "ZONE B",
            fillColor: "#F02871"
        },
        {
            templateAreaId: 8,
            name: "LEFT CENTER 3",
            vertices: [
                { x: 220, y: 539.5 },
                { x: 308.5, y: 503.5 },
                { x: 318.5, y: 525.5 },
                { x: 334, y: 545 },
                { x: 255.5, y: 601 },
                { x: 234, y: 570.5 }
            ],
            zone: "ZONE B",
            fillColor: "#F02871"
        },
        {
            templateAreaId: 9,
            name: "RIGHT CENTER 3",
            vertices: [
                { x: 779.5, y: 539 },
                { x: 691, y: 503 },
                { x: 681, y: 525 },
                { x: 665.5, y: 544.5 },
                { x: 744, y: 600.5 },
                { x: 765.5, y: 570 }
            ],
            zone: "ZONE B",
            fillColor: "#F02871"
        },
        {
            templateAreaId: 10,
            name: "LEFT CENTER 4",
            vertices: [
                { x: 260.5, y: 607 },
                { x: 337.5, y: 549 },
                { x: 354, y: 569 },
                { x: 372.5, y: 585.5 },
                { x: 314, y: 661.5 },
                { x: 281, y: 633.5 }
            ],
            zone: "ZONE B",
            fillColor: "#F02871"
        },
        {
            templateAreaId: 11,
            name: "RIGHT CENTER 4",
            vertices: [
                { x: 740.5, y: 605 },
                { x: 663.5, y: 547 },
                { x: 647, y: 567 },
                { x: 628.5, y: 583.5 },
                { x: 687, y: 659.5 },
                { x: 720, y: 631.5 }
            ],
            zone: "ZONE B",
            fillColor: "#F02871"
        },
        {
            templateAreaId: 12,
            name: "LEFT CENTER 5",
            vertices: [
                { x: 318, y: 664 },
                { x: 374, y: 588 },
                { x: 397, y: 602.5 },
                { x: 417, y: 612.5 },
                { x: 379, y: 699.5 },
                { x: 343.5, y: 683.5 }
            ],
            zone: "ZONE B",
            fillColor: "#F02871"
        },
        {
            templateAreaId: 13,
            name: "RIGHT CENTER 5",
            vertices: [
                { x: 681.5, y: 663 },
                { x: 625.5, y: 587 },
                { x: 602.5, y: 601.5 },
                { x: 582.5, y: 611.5 },
                { x: 620.5, y: 698.5 },
                { x: 656, y: 682.5 }
            ],
            zone: "ZONE B",
            fillColor: "#F02871"
        },
        {
            templateAreaId: 14,
            name: "LEFT CENTER 6",
            vertices: [
                { x: 387.5, y: 702.5 },
                { x: 404.5, y: 655 },
                { x: 434.5, y: 664.5 },
                { x: 465, y: 670 },
                { x: 454.5, y: 721.5 },
                { x: 418, y: 712.5 }
            ],
            zone: "ZONE B",
            fillColor: "#F02871"
        },
        {
            templateAreaId: 15,
            name: "CENTER BOTTOM 1",
            vertices: [
                { x: 464.5, y: 720.5 },
                { x: 470, y: 671.5 },
                { x: 498, y: 674 },
                { x: 530, y: 671.5 },
                { x: 535.5, y: 720.5 },
                { x: 500.5, y: 723.5 }
            ],
            zone: "ZONE A",
            fillColor: "#F02871"
        },
        {
            templateAreaId: 16,
            name: "RIGHT CENTER 6",
            vertices: [
                { x: 612, y: 702.5 },
                { x: 595, y: 655 },
                { x: 565, y: 664.5 },
                { x: 534.5, y: 670 },
                { x: 545, y: 721.5 },
                { x: 581.5, y: 712.5 }
            ],
            zone: "ZONE B",
            fillColor: "#F02871"
        },
        // Center connecting bridge area with special stroke
        {
            templateAreaId: 17,
            name: "CENTER BRIDGE",
            vertices: [
                { x: 466.665, y: 627.899 },
                { x: 466.94, y: 627.967 },
                { x: 467.223, y: 627.989 },
                { x: 498.723, y: 630.489 },
                { x: 498.996, y: 630.511 },
                { x: 499.269, y: 630.489 },
                { x: 531.769, y: 627.989 },
                { x: 532.056, y: 627.968 },
                { x: 532.335, y: 627.899 },
                { x: 557.7, y: 621.669 },
                { x: 567.976, y: 652.495 },
                { x: 538.925, y: 659.538 },
                { x: 500.987, y: 662.986 },
                { x: 459.088, y: 659.536 },
                { x: 430.561, y: 652.075 },
                { x: 441.248, y: 621.656 }
            ],
            zone: "ZONE A",
            fillColor: "#000000"
        },
        // Left side pink seating areas
        {
            templateAreaId: 18,
            name: "LEFT SIDE 1",
            vertices: [
                { x: 218, y: 305 },
                { x: 306.5, y: 342.5 },
                { x: 298.5, y: 365 },
                { x: 294.5, y: 391.5 },
                { x: 200, y: 374.5 },
                { x: 207, y: 337 }
            ],
            zone: "ZONE B",
            fillColor: "#F02871"
        },
        {
            templateAreaId: 19,
            name: "RIGHT SIDE 1",
            vertices: [
                { x: 782, y: 305 },
                { x: 693.5, y: 342.5 },
                { x: 701.5, y: 365 },
                { x: 705.5, y: 391.5 },
                { x: 800, y: 374.5 },
                { x: 793, y: 337 }
            ],
            zone: "ZONE B",
            fillColor: "#F02871"
        },
        {
            templateAreaId: 20,
            name: "LEFT SIDE 2",
            vertices: [
                { x: 289.5, y: 289 },
                { x: 376.5, y: 289 },
                { x: 376.5, y: 411 },
                { x: 311.5, y: 411 },
                { x: 311.5, y: 390 },
                { x: 318, y: 368.5 },
                { x: 325.5, y: 349 },
                { x: 325.5, y: 321 }
            ],
            zone: "ZONE B",
            fillColor: "#F02871"
        },
        {
            templateAreaId: 21,
            name: "LEFT SIDE 3",
            vertices: [
                { x: 310.5, y: 427 },
                { x: 376.5, y: 427 },
                { x: 376.5, y: 562 },
                { x: 349, y: 535 },
                { x: 330.5, y: 505 },
                { x: 320, y: 478.5 },
                { x: 312, y: 450 }
            ],
            zone: "ZONE B",
            fillColor: "#F02871"
        },
        {
            templateAreaId: 22,
            name: "LEFT SIDE 4",
            vertices: [
                { x: 392.5, y: 427 },
                { x: 420.5, y: 427 },
                { x: 420.5, y: 494.5 },
                { x: 451.5, y: 494.5 },
                { x: 451.5, y: 602.5 },
                { x: 427.5, y: 595 },
                { x: 407.5, y: 585 },
                { x: 392.5, y: 574 }
            ],
            zone: "ZONE B",
            fillColor: "#F02871"
        },
        // Right side pink seating areas (mirrored)
        {
            templateAreaId: 23,
            name: "RIGHT SIDE 2",
            vertices: [
                { x: 710.5, y: 289 },
                { x: 623.5, y: 289 },
                { x: 623.5, y: 411 },
                { x: 688.5, y: 411 },
                { x: 688.5, y: 390 },
                { x: 682, y: 368.5 },
                { x: 674.5, y: 349 },
                { x: 674.5, y: 321 }
            ],
            zone: "ZONE B",
            fillColor: "#F02871"
        },
        {
            templateAreaId: 24,
            name: "RIGHT SIDE 3",
            vertices: [
                { x: 689.5, y: 427 },
                { x: 623.5, y: 427 },
                { x: 623.5, y: 562 },
                { x: 651, y: 535 },
                { x: 669.5, y: 505 },
                { x: 680, y: 478.5 },
                { x: 688, y: 450 }
            ],
            zone: "ZONE B",
            fillColor: "#F02871"
        },
        {
            templateAreaId: 25,
            name: "RIGHT SIDE 4",
            vertices: [
                { x: 607.5, y: 427 },
                { x: 579.5, y: 427 },
                { x: 579.5, y: 494.5 },
                { x: 548.5, y: 494.5 },
                { x: 548.5, y: 602.5 },
                { x: 572.5, y: 595 },
                { x: 592.5, y: 585 },
                { x: 607.5, y: 574 }
            ],
            zone: "ZONE B",
            fillColor: "#F02871"
        },
        // Center bottom section
        {
            templateAreaId: 26,
            name: "CENTER BOTTOM",
            vertices: [
                { x: 464.5, y: 495 },
                { x: 541.5, y: 495 },
                { x: 541.5, y: 605.203 },
                { x: 503.5, y: 609 },
                { x: 464.5, y: 605.203 }
            ],
            zone: "ZONE A",
            fillColor: "#F02871"
        },
        // Left outer pink areas
        {
            templateAreaId: 27,
            name: "LEFT OUTER 1",
            vertices: [
                { x: 106.5, y: 339.5 },
                { x: 191.5, y: 356 },
                { x: 187.5, y: 382.5 },
                { x: 186, y: 412 },
                { x: 98.5, y: 409 },
                { x: 98.5, y: 370 }
            ],
            zone: "ZONE C",
            fillColor: "#FFA9CB"
        },
        {
            templateAreaId: 28,
            name: "LEFT OUTER 2",
            vertices: [
                { x: 98, y: 420 },
                { x: 185.5, y: 421 },
                { x: 185.5, y: 447 },
                { x: 190, y: 476.5 },
                { x: 103.5, y: 491 },
                { x: 98, y: 455 }
            ],
            zone: "ZONE C",
            fillColor: "#FFA9CB"
        },
        {
            templateAreaId: 29,
            name: "LEFT OUTER 3",
            vertices: [
                { x: 105, y: 499 },
                { x: 191, y: 482.5 },
                { x: 196.5, y: 507 },
                { x: 206.5, y: 535.5 },
                { x: 125.5, y: 567.5 },
                { x: 113, y: 532.5 }
            ],
            zone: "ZONE C",
            fillColor: "#FFA9CB"
        },
        // Right outer pink areas (mirrored)
        {
            templateAreaId: 30,
            name: "RIGHT OUTER 1",
            vertices: [
                { x: 893.5, y: 340 },
                { x: 808.5, y: 356.5 },
                { x: 812.5, y: 383 },
                { x: 814, y: 412.5 },
                { x: 901.5, y: 409.5 },
                { x: 901.5, y: 370.5 }
            ],
            zone: "ZONE C",
            fillColor: "#FFA9CB"
        },
        {
            templateAreaId: 31,
            name: "RIGHT OUTER 2",
            vertices: [
                { x: 900.5, y: 418 },
                { x: 813, y: 419 },
                { x: 813, y: 445 },
                { x: 808.5, y: 474.5 },
                { x: 895, y: 489 },
                { x: 900.5, y: 453 }
            ],
            zone: "ZONE C",
            fillColor: "#FFA9CB"
        },
        {
            templateAreaId: 32,
            name: "RIGHT OUTER 3",
            vertices: [
                { x: 895, y: 499.5 },
                { x: 809, y: 483 },
                { x: 803.5, y: 507.5 },
                { x: 793.5, y: 536 },
                { x: 874.5, y: 568 },
                { x: 887, y: 533 }
            ],
            zone: "ZONE C",
            fillColor: "#FFA9CB"
        },
        // Additional outer areas continuing the pattern
        {
            templateAreaId: 33,
            name: "LEFT OUTER 4",
            vertices: [
                { x: 128, y: 575 },
                { x: 209, y: 542.5 },
                { x: 219.5, y: 565.5 },
                { x: 235, y: 591 },
                { x: 162, y: 637.5 },
                { x: 141.5, y: 605.5 }
            ],
            zone: "ZONE C",
            fillColor: "#FFA9CB"
        },
        {
            templateAreaId: 34,
            name: "RIGHT OUTER 4",
            vertices: [
                { x: 871.5, y: 575.5 },
                { x: 790.5, y: 543 },
                { x: 780, y: 566 },
                { x: 764.5, y: 591.5 },
                { x: 837.5, y: 638 },
                { x: 858, y: 606 }
            ],
            zone: "ZONE C",
            fillColor: "#FFA9CB"
        },
        // Continue with more outer areas following the SVG pattern
        {
            templateAreaId: 35,
            name: "LEFT OUTER 5",
            vertices: [
                { x: 166, y: 645.5 },
                { x: 239, y: 597.5 },
                { x: 254.5, y: 619 },
                { x: 274, y: 640.5 },
                { x: 211.5, y: 700 },
                { x: 186.5, y: 674.5 }
            ],
            zone: "ZONE C",
            fillColor: "#FFA9CB"
        },
        {
            templateAreaId: 36,
            name: "RIGHT OUTER 5",
            vertices: [
                { x: 833.5, y: 645 },
                { x: 760.5, y: 597 },
                { x: 745, y: 618.5 },
                { x: 725.5, y: 640 },
                { x: 788, y: 699.5 },
                { x: 813, y: 674 }
            ],
            zone: "ZONE C",
            fillColor: "#FFA9CB"
        },
        // Bottom outer areas
        {
            templateAreaId: 37,
            name: "LEFT OUTER 6",
            vertices: [
                { x: 215.5, y: 707.5 },
                { x: 278.5, y: 645 },
                { x: 299.5, y: 665 },
                { x: 321, y: 681.5 },
                { x: 271, y: 752 },
                { x: 244.5, y: 734.5 }
            ],
            zone: "ZONE C",
            fillColor: "#FFA9CB"
        },
        {
            templateAreaId: 38,
            name: "RIGHT OUTER 6",
            vertices: [
                { x: 784, y: 707.5 },
                { x: 721, y: 645 },
                { x: 700, y: 665 },
                { x: 678.5, y: 681.5 },
                { x: 728.5, y: 752 },
                { x: 755, y: 734.5 }
            ],
            zone: "ZONE C",
            fillColor: "#FFA9CB"
        },
        // Bottom center areas
        {
            templateAreaId: 39,
            name: "LEFT BOTTOM",
            vertices: [
                { x: 278, y: 758 },
                { x: 326.5, y: 685.5 },
                { x: 351, y: 700.5 },
                { x: 375.5, y: 711.5 },
                { x: 340.5, y: 791 },
                { x: 309.5, y: 777.5 }
            ],
            zone: "ZONE C",
            fillColor: "#FFA9CB"
        },
        {
            templateAreaId: 40,
            name: "RIGHT BOTTOM",
            vertices: [
                { x: 722, y: 757.5 },
                { x: 673.5, y: 685 },
                { x: 649, y: 700 },
                { x: 624.5, y: 711 },
                { x: 659.5, y: 790.5 },
                { x: 690.5, y: 777 }
            ],
            zone: "ZONE C",
            fillColor: "#FFA9CB"
        },
        // Bottom center final areas
        {
            templateAreaId: 41,
            name: "LEFT CENTER BOTTOM",
            vertices: [
                { x: 348, y: 796 },
                { x: 381.5, y: 714 },
                { x: 409.5, y: 724.5 },
                { x: 434, y: 731.5 },
                { x: 416, y: 815.5 },
                { x: 381.5, y: 807 }
            ],
            zone: "ZONE C",
            fillColor: "#FFA9CB"
        },
        {
            templateAreaId: 42,
            name: "RIGHT CENTER BOTTOM",
            vertices: [
                { x: 650.5, y: 796 },
                { x: 617, y: 714 },
                { x: 589, y: 724.5 },
                { x: 564.5, y: 731.5 },
                { x: 582.5, y: 815.5 },
                { x: 617, y: 807 }
            ],
            zone: "ZONE C",
            fillColor: "#FFA9CB"
        },
        // Final center bottom areas
        {
            templateAreaId: 43,
            name: "CENTER BOTTOM LEFT",
            vertices: [
                { x: 424.5, y: 817 },
                { x: 441, y: 731.5 },
                { x: 469, y: 735.5 },
                { x: 497, y: 737 },
                { x: 495.5, y: 823.5 },
                { x: 461.5, y: 822 }
            ],
            zone: "ZONE C",
            fillColor: "#FFA9CB"
        },
        {
            templateAreaId: 44,
            name: "CENTER BOTTOM RIGHT",
            vertices: [
                { x: 503.5, y: 825 },
                { x: 503.5, y: 737 },
                { x: 530.5, y: 737 },
                { x: 559.5, y: 732 },
                { x: 575, y: 817.5 },
                { x: 543, y: 823.5 }
            ],
            zone: "ZONE C",
            fillColor: "#FFA9CB"
        }
    ]
};

const MapTemplate2: React.FC = () => {
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
        ctx.fillRect(0, 0, mapTemplate.mapWidth / scale, mapTemplate.mapHeight / scale);

        pathsRef.current.clear();
        mapTemplate.areas.forEach((area) => {
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

            // Add stroke for stage area
            if (area.name === "STAGE") {
                ctx.strokeStyle = "#E9B5CB";
                ctx.lineWidth = selectedAreaId === area.templateAreaId ? 10 / scale : 7 / scale;
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
                ctx.lineWidth = selectedAreaId === area.templateAreaId ? 10 / scale : 7 / scale;
                ctx.stroke();
            } else {
                // Add subtle stroke for other areas
                ctx.strokeStyle = "#333333";
                ctx.lineWidth = selectedAreaId === area.templateAreaId ? 3 / scale : 1 / scale;
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
            <h1 className="text-3xl font-bold text-white mb-6">Stage Black Pink Map</h1>
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
                <p>Zones: Zone A (Pink Center), Zone B (Pink Sides), Zone C (Light Pink Outer)</p>
                <p>Total Areas: 44 (including CENTER BRIDGE connection)</p>
            </div>
        </div>
    );
};

export default MapTemplate2; 