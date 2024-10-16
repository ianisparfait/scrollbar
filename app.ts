type ScrollbarParam = {
    container: string;
    indicator: string;
    parent: string;
    percentage: number;
    containerColor?: string;
    indicatorColor?: string;
};

type ScrollBarStyle = {
    opacity: number;
    height?: string;
    top?: string;
}

class Scrollbar {
    public readonly element: HTMLElement;
    public readonly indicator: HTMLElement;
    private readonly parent: HTMLElement;

    public percentage: number;

    private readonly containerColor?: string | null;
    private readonly indicatorColor?: string | null;

    private scrollTimeout: number | null = null;
    private readonly timeTriggerScroll = 2;

    private readonly opacityBasic = 1;
    private readonly opacityTarget = 0.2;
    private style: ScrollBarStyle = { opacity: this.opacityTarget };

    constructor(parameters: ScrollbarParam) {
        this.element = document.querySelector(parameters.container) as HTMLElement;
        this.indicator = document.querySelector(parameters.indicator) as HTMLElement;
        this.parent = document.querySelector(parameters.parent) as HTMLElement;

        this.percentage = parameters.percentage;

        this.containerColor = parameters.containerColor;
        this.indicatorColor = parameters.indicatorColor;
    }

    public init(): void {
        if (this.containerColor || this.indicatorColor) this.Colors();
        this.defineStyle();
        this.updateIndicator();

        window.addEventListener("scroll", () => this.handleScroll());
        window.addEventListener("resize", () => this.defineStyle());
    }

    private Colors(): void {
        if (this.containerColor) this.element.style.backgroundColor = this.containerColor;
        if (this.indicatorColor) this.indicator.style.backgroundColor = this.indicatorColor;
    }

    private defineStyle(): void {
        let baseCalcul;

        if (this.parentHeight() > window.innerHeight) baseCalcul = window.innerHeight;
        else baseCalcul = this.parentHeight();

        let elementHeight = baseCalcul * this.percentage;
        this.style = {
            opacity: 0.2,
            height: `${elementHeight}px`,
            top: `${(baseCalcul - elementHeight) / 2}px`,
        };

        this.updateScrollbar();
        this.element.addEventListener("mouseenter", () => this.styleActivity({ opacity: this.opacityBasic }));
        this.element.addEventListener("mouseleave", () => this.styleActivity({ opacity: this.opacityTarget }));
    }

    private handleScroll(): void {
        this.styleActivity({opacity: this.opacityBasic});

        if (this.scrollTimeout) {
            clearTimeout(this.scrollTimeout);
        }

        this.scrollTimeout = window.setTimeout(() => {
            this.styleActivity({opacity: this.opacityTarget});
        }, this.timeTriggerScroll * 1000);

        this.updateIndicator();
    }

    private updateIndicator(): void {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const totalHeight = this.parent.scrollHeight - window.innerHeight;

        const progressHeight = (window.innerHeight / this.parent.scrollHeight) * this.element.clientHeight;
        this.indicator.style.height = `${progressHeight}px`;

        const scrollPercent = scrollTop / totalHeight;
        const indicatorTop = scrollPercent * (this.element.clientHeight - progressHeight);
        this.indicator.style.transform = `translateY(${indicatorTop}px)`;
    }

    private updateScrollbar(): void {
        this.element.style.opacity = `${this.style.opacity}`;
        this.element.style.height = this.style.height ? this.style.height : "";
        this.element.style.top = this.style.top ? this.style.top : "";
    }

    private parentHeight(): number {
        return this.parent.getBoundingClientRect().height;
    }

    private styleActivity({opacity}: { opacity: number }): void {
        this.element.style.opacity = `${opacity}`;
    }
}

const scrollbar = new Scrollbar({
container: ".scrollbar",
indicator: ".scrollbar-indicator",
parent: "body",
percentage: 0.85,
} as ScrollbarParam).init();
