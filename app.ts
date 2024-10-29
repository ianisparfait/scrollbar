/**
 * ScrollbarParam parameters for configuring the scroll behavior and appearance.
 * @typedef {Object} ScrollbarParam
 * @property {string} container - CSS selector for the scrollbar container element.
 * @property {string} indicator - CSS selector for the scrollbar indicator element.
 * @property {string} parent - CSS selector for the parent element that contains the scrollable content.
 * @property {number} percentage - Percentage of the scrollbar height relative to the container.
 * @property {string} right - Right position of the scrollbar element.
 * @property {string} [containerColor] - Optional background color for the scrollbar container.
 * @property {string} [indicatorColor] - Optional background color for the scrollbar indicator.
 * @property {number} [velocity=1] - Optional velocity multiplier for scroll speed.
 */
type ScrollbarParam = {
  parent: string;
  percentage: number;
  right?: string;
  containerColor?: string;
  indicatorColor?: string;
  velocity?: number;
};

/**
 * ScrollBarStyle defines the style properties for the scrollbar.
 * @typedef {Object} ScrollBarStyle
 * @property {number} opacity - Opacity of the scrollbar.
 * @property {string} [height] - Height of the scrollbar.
 * @property {string} [top] - Top position of the scrollbar.
 */
type ScrollBarStyle = {
  opacity: number;
  height?: string;
  top?: string;
  right?: string;
};

/**
 * Scrollbar class manages a custom vertical scrollbar for a scrollable element.
 */
class Scrollbar {
  // Defines HTML elements
  public element: HTMLElement;
  public indicator: HTMLElement;
  private readonly parent: HTMLElement;

  // Parameters that can be defined at class creation
  /* Height taken from the container */
  public readonly percentage: number;
  /* Drag speed */
  public readonly velocity: number;
  /* css Colors can be defined */
  private readonly containerColor?: string | null;
  private readonly indicatorColor?: string | null;

  // Others parameters
  private scrollTimeout: number | null = null;
  /* Time in sec for the setTimeout */
  private readonly timeTriggerScroll = 2;

  // Global scrollbar style
  private readonly opacityBasic = 1;
  private readonly opacityTarget = 0.2;
  /* Position from the right side of parent */
  private right?: string;
  private style: ScrollBarStyle = { opacity: this.opacityTarget };

  // Drag events & parameters
  private isDragging: boolean = false;
  private startY: number = 0;
  private startScrollTop: number = 0;

  private readonly isScrollbarNeeded: boolean = true;

  /**
   * Creates a new Scrollbar instance.
   * @param {ScrollbarParam} parameters - The configuration parameters for the scrollbar.
   */
  constructor(parameters: ScrollbarParam) {
    this.parent = document.querySelector(parameters.parent) as HTMLElement;

    if (!this.needsScrollbar({ parent: this.parent })) this.isScrollbarNeeded = false;
    if (this.isScrollbarNeeded) this.createElements();

    this.percentage = parameters.percentage;

    this.containerColor = parameters.containerColor;
    this.indicatorColor = parameters.indicatorColor;

    this.velocity = parameters.velocity ?? 1;
    this.right = parameters.right;
  }

  /**
   * Initializes the scrollbar by setting colors, styles, and adding event listeners.
   * This should be called after creating a Scrollbar instance.
   */
  public init(): void {
    if (!this.isScrollbarNeeded) return;

    if (this.containerColor || this.indicatorColor) this.Colors();
    this.defineStyle();
    this.updateIndicator();

    window.addEventListener("scroll", () => this.handleScroll());
    window.addEventListener("resize", () => this.defineStyle());

    this.indicator.addEventListener("mousedown", (e: MouseEvent) => this.startDrag({ event: e }));
    window.addEventListener("mousemove", (e: MouseEvent) => this.onDrag({ event: e }));
    window.addEventListener("mouseup", () => this.stopDrag());
  }

  /**
   * Sets the colors of the scrollbar container and indicator if specified.
   * @private
   */
  private Colors(): void {
    if (this.containerColor)
      this.element.style.backgroundColor = this.containerColor;
    if (this.indicatorColor)
      this.indicator.style.backgroundColor = this.indicatorColor;
  }

  /**
   * createElements creates the scrollbar.
   * @private
   */
  private createElements(): void {
    this.element = document.createElement("div") as HTMLElement;
    this.element.classList.add("scrollbar");

    this.indicator = document.createElement("div") as HTMLElement;
    this.indicator.classList.add("scrollbar-indicator");

    this.element.appendChild(this.indicator);
    this.parent.appendChild(this.element);
  }

  /**
   * Defines the initial style of the scrollbar based on the container height and percentage.
   * @private
   */
  private defineStyle(): void {
    let baseCalcul;

    if (this.parentHeight() > window.innerHeight)
      baseCalcul = window.innerHeight;
    else baseCalcul = this.parentHeight();

    let elementHeight = baseCalcul * this.percentage;
    this.style = {
      opacity: 0.2,
      height: `${elementHeight}px`,
      top: `${(baseCalcul - elementHeight) / 2}px`,
    };
    if (this.right) this.style.right = `${this.right}`;

    this.updateScrollbar();
    this.element.addEventListener("mouseenter", () =>
      this.styleActivity({ opacity: this.opacityBasic })
    );
    this.element.addEventListener("mouseleave", () =>
      this.styleActivity({ opacity: this.opacityTarget })
    );
  }

  /**
   * Handles the scroll event to update the scrollbar position and visibility.
   * Adjusts the opacity based on scroll activity.
   * @private
   */
  private handleScroll(): void {
    this.styleActivity({ opacity: this.opacityBasic });

    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }

    this.scrollTimeout = window.setTimeout(() => {
      this.styleActivity({ opacity: this.opacityTarget });
    }, this.timeTriggerScroll * 1000);

    this.updateIndicator();
  }

  /**
   * Check if the parent container need a scrollbar.
   * Also check if the parent is the <body> tag or not and adapts the condition.
   * @returns {boolean} - returns true is scrollbar is needed.
   */
  private needsScrollbar({ parent }: { parent: HTMLElement }): boolean {
    if (parent.tagName.toLowerCase() === "body") {
      const doc = document.documentElement;
      return doc.scrollHeight > window.innerHeight;
    } else {
      return parent.scrollHeight > parent.clientHeight;
    }
  }

  /**
   * Updates the position and size of the scrollbar indicator based on the current scroll position.
   * @private
   */
  private updateIndicator(): void {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const totalHeight = this.parent.scrollHeight - window.innerHeight;

    const progressHeight =
      (window.innerHeight / this.parent.scrollHeight) *
      this.element.clientHeight;
    this.indicator.style.height = `${progressHeight}px`;

    const scrollPercent = scrollTop / totalHeight;
    const indicatorTop =
      scrollPercent * (this.element.clientHeight - progressHeight);
    this.indicator.style.transform = `translateY(${indicatorTop}px)`;
  }

  /**
   * Updates the scrollbar's CSS style properties.
   * @private
   */
  private updateScrollbar(): void {
    this.element.style.opacity = `${this.style.opacity}`;
    this.element.style.height = this.style.height ? this.style.height : "";
    this.element.style.top = this.style.top ? this.style.top : "";
    if (this.style.right) this.element.style.right = `${this.style.right}`;
  }

  /**
   * Starts the drag event for the scrollbar indicator, allowing manual scrolling.
   * @param {MouseEvent} event - The mousedown event.
   * @private
   */
  private startDrag({ event } : { event: MouseEvent }): void {
    this.isDragging = true;
    this.startY = event.clientY;
    this.startScrollTop = window.scrollY || document.documentElement.scrollTop;
    document.body.style.userSelect = "none";
  }

  /**
   * Updates the scroll position based on mouse movement during a drag event.
   * @param {MouseEvent} event - The mousemove event.
   * @private
   */
  private onDrag({ event } : { event: MouseEvent }): void {
    if (!this.isDragging) return;

    const deltaY = event.clientY - this.startY;
    const scrollPercent = (deltaY * this.velocity) / this.element.clientHeight;

    const totalHeight = this.parent.scrollHeight - window.innerHeight;
    window.scrollTo(0, this.startScrollTop + scrollPercent * totalHeight);
  }

  /**
   * Stops the drag event and re-enables text selection.
   * @private
   */
  private stopDrag(): void {
    this.isDragging = false;
    document.body.style.userSelect = "";
  }

  /**
   * Returns the height of the parent element.
   * @returns {number} The height of the parent element.
   * @private
   */
  private parentHeight(): number {
    return this.parent.getBoundingClientRect().height;
  }

  /**
   * Updates the opacity of the scrollbar element based on user interaction.
   * @param {ScrollBarStyle} style - Object containing the opacity to apply to the scrollbar.
   * @private
   */
  private styleActivity({ opacity }: { opacity: number }): void {
    this.element.style.opacity = `${opacity}`;
  }
}

// Example usage
const scrollbar = new Scrollbar({
  parent: "body",
  percentage: 0.85,
  velocity: 2,
} as ScrollbarParam).init();
