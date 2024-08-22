export function randomGradient(num: number): string[] {
    const gradients = [];

    for (let index = 0; index < num - 1; index++) {
        gradients.push(
            `radial-gradient(circle at ${Math.floor(
                Math.random() * 100
            )}% ${Math.floor(
                Math.random() * 100
            )}%, rgb(224, 224, 224), rgb(94, 74, 227))`
        );
    }

    gradients.push(gradients[0]);

    return gradients;
}

export function randomGradient2(num: number): string[] {
    let gradients = [];
    const firstElem = `radial-gradient(
        circle at 30% 65%,
        rgb(94, 74, 227),
        rgb(32, 33, 37)
    )`;

    for (let index = 0; index < num; index++) {
        gradients.push(
            `radial-gradient(circle at ${Math.floor(
                Math.random() * 100
            )}% ${Math.floor(
                Math.random() * 100
            )}%, rgb(224, 224, 224), rgb(94, 74, 227))`
        );
    }

    for (let index = 0; index < num; index++) {
        gradients.push(
            `radial-gradient(circle at ${Math.floor(
                Math.random() * 100
            )}% ${Math.floor(
                Math.random() * 100
            )}%, rgb(94, 74, 227), rgb(32, 33, 37))`
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
            )}deg, rgb(94, 74, 227), rgb(80, 58, 200), rgb(32, 33, 37))`
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
            #5e4ae3 ${Math.floor(Math.random() * 40)}%,
            #5e4ae3 ${Math.floor(Math.random() * 50)}%,
            transparent 12%,
            transparent 100%
        ),
        radial-gradient(circle at ${x3}% ${y3}%, #5e4ae3 ${Math.floor(
                Math.random() * 100
            )}%, transparent 12%)`
        );
    }

    gradients.push(gradients[0]);

    return gradients;
}
