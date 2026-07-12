declare module "react-test-renderer" {
  import type { ReactElement } from "react";

  export interface ReactTestRendererJSON {
    readonly type: string;
    readonly props: Record<string, unknown>;
    readonly children: ReadonlyArray<ReactTestRendererJSON | string> | null;
  }

  export interface ReactTestInstance {
    readonly props: Record<string, unknown>;
    findByType(type: unknown): ReactTestInstance;
    findAllByType(type: unknown): ReactTestInstance[];
    findAllByProps(props: Record<string, unknown>): ReactTestInstance[];
  }

  export interface ReactTestRenderer {
    readonly root: ReactTestInstance;
    toJSON(): ReactTestRendererJSON | ReactTestRendererJSON[] | null;
    unmount(): void;
    update(element: ReactElement): void;
  }

  export function create(element: ReactElement): ReactTestRenderer;
  export function act(callback: () => void | Promise<void>): void;

  const TestRenderer: {
    create: typeof create;
    act: typeof act;
  };

  export default TestRenderer;
}
