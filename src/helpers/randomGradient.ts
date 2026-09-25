export function randomGradient(num: number): string[] {
    const gradients = [];

    for (let index = 0; index < num - 1; index++) {
        gradients.push(
            `radial-gradient(circle at ${Math.floor(
                Math.random() * 100
            )}% ${Math.floor(
                Math.random() * 100
            )}%, rgb(232, 223, 208), rgb(74, 52, 112))`
        );
    }

    gradients.push(gradients[0]);

    return gradients;
}

export function randomGradient2(num: number): string[] {
    let gradients = [];
    const firstElem = `radial-gradient(
        circle at 30% 65%,
        rgb(74, 52, 112),
        rgb(36, 26, 51)
    )`;

    for (let index = 0; index < num; index++) {
        gradients.push(
            `radial-gradient(circle at ${Math.floor(
                Math.random() * 100
            )}% ${Math.floor(
                Math.random() * 100
            )}%, rgb(232, 223, 208), rgb(74, 52, 112))`
        );
    }

    for (let index = 0; index < num; index++) {
        gradients.push(
            `radial-gradient(circle at ${Math.floor(
                Math.random() * 100
            )}% ${Math.floor(
                Math.random() * 100
            )}%, rgb(74, 52, 112), rgb(36, 26, 51))`
        );
    }
    gradients.sort(() => Math.random() - 0.5);
    const gradientsCopy = [firstElem,...gradients.slice(0, num-2), gradients[0]];

    return gradientsCopy;
}

export function randomLinearGradient(num: number): string[] {
    const gradients = [];

    for (let index = 0; index < num - 1; index++) {
        gradients.push(
            `linear-gradient(${Math.floor(
                Math.random() * 360
            )}deg, rgb(74, 52, 112), rgb(142, 120, 196), rgb(36, 26, 51))`
        );
    }

    gradients.sort(() => Math.random() - 0.5);
    gradients.push(gradients[0]);
    console.log(gradients);
    return gradients.slice(0, num);
}

export function randomPattern(num: number): string[] {
    const gradients = [];

    for (let index = 0; index < num - 1; index++) {
        const x1 = Math.floor(Math.random() * 100);
        const y1 = Math.floor(Math.random() * 100);
        const x3 = Math.floor(Math.random() * 100);
        const y3 = Math.floor(Math.random() * 100);

        gradients.push(
            `radial-gradient(
            circle at ${x1}% ${y1}%,
            #4A3470 ${Math.floor(Math.random() * 40)}%,
            #4A3470 ${Math.floor(Math.random() * 50)}%,
            transparent 12%,
            transparent 100%
        ),
        radial-gradient(circle at ${x3}% ${y3}%, #4A3470 ${Math.floor(
                Math.random() * 100
            )}%, transparent 12%)`
        );
    }

    gradients.push(gradients[0]);

    return gradients;
}
