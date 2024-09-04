import type { BeanCollection, IRowNodeStage, NamedBean, StageExecuteParams } from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';
export declare class GroupStage extends BeanStub implements NamedBean, IRowNodeStage {
    beanName: "groupStage";
    private selectableService;
    private strategy;
    wireBeans(beans: BeanCollection): void;
    execute(params: StageExecuteParams): void;
    destroy(): void;
}
