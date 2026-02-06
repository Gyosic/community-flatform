"use client";

import { LayoutGrid, Plus, RotateCcw, Trash2 } from "lucide-react";
import { useState } from "react";
import ReactGridLayout, {
  Layout,
  LayoutItem,
  useContainerWidth,
  verticalCompactor,
} from "react-grid-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { Calendar, FileText, ImageIcon, List, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ComponentType {
  id: string;
  name?: string;
  icon?: React.ReactNode;
  description?: string;
  props: Record<string, unknown>;
}

const components: ComponentType[] = [
  {
    id: "post-list",
    name: "게시글 목록",
    icon: <FileText className="h-5 w-5" />,
    description: "게시판의 게시글 목록을 표시합니다",
    props: {},
  },
  {
    id: "trending-posts",
    name: "인기 게시글",
    icon: <TrendingUp className="h-5 w-5" />,
    description: "조회수가 높은 인기 게시글을 표시합니다",
    props: {},
  },
  {
    id: "recent-posts",
    name: "최신 게시글",
    icon: <List className="h-5 w-5" />,
    description: "최근에 작성된 게시글을 표시합니다",
    props: {},
  },
  {
    id: "banner",
    name: "배너",
    icon: <ImageIcon className="h-5 w-5" />,
    description: "이미지 배너를 표시합니다",
    props: {},
  },
  {
    id: "calendar",
    name: "캘린더",
    icon: <Calendar className="h-5 w-5" />,
    description: "이벤트 캘린더를 표시합니다",
    props: {},
  },
];

export interface LayoutWidget extends LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  component?: ComponentType;
}

interface GridLayoutProps {
  layout: LayoutWidget[];
  setLayout: (layout: LayoutWidget[]) => void;
}
export function GridLayout({ layout, setLayout }: GridLayoutProps) {
  const { width, containerRef, mounted } = useContainerWidth();
  const [selectedWidget, setSelectedWidget] = useState<LayoutWidget | null>(null);
  // const [layout, setLayout] = useState<LayoutWidget[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleResetLayout = () => {
    setLayout([]);
    setSelectedWidget(null);
  };

  const handleAddWidget = () => {
    const newWidget: LayoutWidget = {
      i: `widget-${Date.now()}`,
      x: 0,
      y: Infinity,
      w: 12,
      h: 3,
      minW: 2,
      minH: 2,
    };
    setLayout([...layout, newWidget]);
    toast.success(`위젯이 추가되었습니다`);
  };

  const handleLayoutChange = (newLayout: Layout) => {
    const updatedLayout = layout.map((widget) => {
      const layoutItem = newLayout.find((item) => item.i === widget.i);
      if (layoutItem) {
        return {
          ...widget,
          x: layoutItem.x,
          y: layoutItem.y,
          w: layoutItem.w,
          h: layoutItem.h,
        };
      }
      return widget;
    });
    setLayout(updatedLayout);
  };

  const handleRemoveWidget = (widgetId: string) => {
    setLayout(layout.filter((w) => w.i !== widgetId));
    if (selectedWidget?.i === widgetId) {
      setSelectedWidget(null);
    }
    toast.success("위젯이 삭제되었습니다");
  };

  const handleComponentClick = (component: ComponentType) => {
    if (!selectedWidget) return;

    const { i } = selectedWidget;

    const newLayout: LayoutWidget[] = layout.map((l) => {
      if (l.i === i) return { ...l, component };
      return l;
    });
    setLayout(newLayout);
    setDialogOpen(false);
  };

  return (
    <div className="h-full flex-1">
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            레이아웃 캔버스
            <div className="flex items-center gap-2">
              {!!layout.length && (
                <Button type="button" variant="outline" onClick={() => handleResetLayout()}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  리셋
                </Button>
              )}
              <Button type="button" onClick={() => handleAddWidget()}>
                <Plus className="mr-2 h-4 w-4" />
                위젯 추가
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="h-full w-full">
          {mounted && (
            <div className="min-h-150 rounded-lg border bg-muted/20 p-4" ref={containerRef}>
              {layout.length === 0 ? (
                <div className="flex h-150 flex-col items-center justify-center rounded-lg text-center">
                  <LayoutGrid className="mb-4 h-16 w-16 text-muted-foreground/50" />
                  <p className="mb-2 font-medium text-lg">레이아웃이 비어있습니다</p>
                  <Button type="button" onClick={() => handleAddWidget()}>
                    <Plus className="mr-2 h-4 w-4" />첫 번째 위젯 추가
                  </Button>
                </div>
              ) : (
                <ReactGridLayout
                  className="layout"
                  layout={layout}
                  gridConfig={{ cols: 12, rowHeight: 60 }}
                  width={width}
                  onLayoutChange={handleLayoutChange}
                  compactor={verticalCompactor}
                >
                  {layout.map((widget) => (
                    <div
                      key={widget.i}
                      className="group overflow-hidden rounded-lg border-2 border-border bg-background shadow-sm transition-shadow hover:shadow-md"
                    >
                      <div className="flex h-full w-full flex-col">
                        {/* Widget Header */}
                        <div className="absolute top-0 right-0 flex items-center justify-end p-3 opacity-0 transition-opacity group-hover:opacity-100">
                          <Button
                            variant="ghost"
                            type="button"
                            size="icon"
                            className="h-6 w-6 text-destructive hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveWidget(widget.i);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>

                        <div className="flex flex-1 items-center justify-center p-3 text-muted-foreground">
                          {widget?.component ? (
                            <div className="flex items-center gap-2">
                              {widget?.component?.icon}
                              <span className="font-medium text-sm">
                                {widget?.component?.name ?? "위젯"}
                              </span>
                            </div>
                          ) : (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDialogOpen(true);
                                setSelectedWidget(widget);
                              }}
                            >
                              <Plus className="h-4 w-4" /> 컨텐츠 추가
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </ReactGridLayout>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="flex flex-col gap-2">
          <DialogHeader>
            <DialogTitle>컨텐츠 선택</DialogTitle>
            <DialogDescription>해당 위젯에 들어갈 컨텐츠를 선택하세요.</DialogDescription>
          </DialogHeader>
          {components.map((component) => {
            return (
              <Card
                className="cursor-pointer gap-2 rounded-lg border p-3 transition-all hover:border-primary hover:bg-accent"
                key={component.id}
                onClick={() => handleComponentClick(component)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="rounded-md bg-primary/10 p-2 transition-colors group-hover:bg-primary/20">
                      {component.icon}
                    </div>
                    {component.name}
                  </CardTitle>
                  <CardDescription className="text-xs">{component.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* <Badge variant="secondary" className="text-xs">
                    {widget.defaultSize.w}x{widget.defaultSize.h}
                  </Badge> */}
                </CardContent>
              </Card>
            );
          })}
        </DialogContent>
      </Dialog>
    </div>
  );
}
