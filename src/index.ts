type Route = {
  pattern: string;
  method: string;
};

class SimpleRouter {
  private _routes: Route[];

  registerRoute(pattern: string, method: string = "*"): void {
    if (!this.isValidRoutePattern(pattern)) throw new Error("Invalid pattern");
    if (
      this._routes.some(
        (router) => router.pattern === pattern && router.method === method
      )
    ) {
      throw new Error(`The route ${pattern} ${method} already exist`);
    }

    this._routes.push({ pattern: this.removeQueryParamsUrl(pattern), method });

    this._routes.sort(
      (a, b) => this.specificity(b.pattern) - this.specificity(a.pattern)
    );
  }

  private matchRoute(path: string, method: string): string | null {
    for (const route of this._routes) {
      if (
        this.matchPattern(path, route.pattern) &&
        (route.method === method || route.method === "*")
      ) {
        return route.pattern;
      }
      return null;
    }
    return null;
  }

  private isValidRoutePattern(pattern: string): boolean {
    const routeRegex = /^\/[a-zA-Z0-9/:*_-]*$/;
    return routeRegex.test(pattern);
  }

  private removeQueryParamsUrl(url: string): string {
    return url.split("?")[0];
  }

  private matchPattern(pathInput: string, pattern: string): boolean {
    const path = this.removeQueryParamsUrl(pathInput);
    const pathSegments = path.split("/");
    const patternSegments = pattern.split("/");

    for (let i = 0; i < patternSegments.length; i++) {
      if (patternSegments[i] === "*") {
        return true;
      }
      if (!pathSegments[i]) {
        return false;
      }
      if (
        patternSegments[i][0] !== ":" &&
        patternSegments[i] !== pathSegments[i]
      ) {
        return false;
      }
    }

    return pathSegments.length === patternSegments.length;
  }

  private specificity(pattern: string): number {
    return pattern.split("/").reduce((score, segment) => {
      if (segment === "*") return score + 1;
      if (segment[0] === ":") return score + 2;
      return score + 3;
    }, 0);
  }
}
