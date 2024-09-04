import type { BeanCollection, IRowNodeStage, StageExecuteParams } from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';
export declare class GroupStrategy extends BeanStub implements IRowNodeStage {
    private columnModel;
    private funcColsService;
    private valueService;
    private beans;
    private selectionService;
    private showRowGroupColsService;
    wireBeans(beans: BeanCollection): void;
    private oldGroupingDetails;
    private oldGroupDisplayColIds;
    execute(params: StageExecuteParams): void;
    private positionLeafsAndGroups;
    private createGroupingDetails;
    private handleTransaction;
    private sortChildren;
    private orderGroups;
    private getExistingPathForNode;
    private moveNodesInWrongPath;
    private moveNode;
    private removeNodes;
    private forEachParentGroup;
    private removeNodesFromParents;
    private removeEmptyGroups;
    private removeFromParent;
    /**
     * This is idempotent, but relies on the `key` field being the same throughout a RowNode's lifetime
     */
    private addToParent;
    private areGroupColsEqual;
    private checkAllGroupDataAfterColsChanged;
    private shotgunResetEverything;
    private noChangeInGroupingColumns;
    private insertNodes;
    private insertOneNode;
    private findParentForNode;
    private getOrCreateNextNode;
    private createGroup;
    private createGroupId;
    private setGroupData;
    private getChildrenMappedKey;
    private setExpandedInitialValue;
    private getGroupInfo;
}
