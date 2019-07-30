import _ from 'lodash';
import classNames from 'classnames';
import React, { useRef, useMemo, useState, useEffect } from 'react';

import { Icon } from '..';

import useResize from './useResize';

const useStateHook = (props) => {
  // modal 弹窗最外层元素  ref
  const modalRef = useRef(null);
  // 监听当前 modal 是否为最小化状态
  const [isMin, setIsMin] = useState(false);
  // 监听当前 modal 是否为最大化状态
  const [isMax, setIsMax] = useState(false);

  // 改变 modal 大小计算返回的 params
  const resizeParams = useResize(modalRef, {
    dragRef: props.dragRef,
    threshold: props.threshold,
    defaultParams: props.defaultParams,
    constraintSize: props.constraintSize,
  });

  useEffect(() => {setIsMin(!!props.isMin);}, [props.isMin]);
  useEffect(() => {setIsMax(!!props.isMax);}, [props.isMax]);

  // 合并计算当前 modal params
  const params = useMemo(() => {
    const minParams = isMin ? props.minParams || props.defaultParams : null;
    let maxParams = null;
    if (modalRef.current && isMax){
      const parentNodeRect = modalRef.current.parentNode.getBoundingClientRect();
      maxParams = props.maxParams || {
        offsetX: 0,
        offsetY: 0,
        width: parentNodeRect.width,
        height: parentNodeRect.height,
      };
    }
    const _params = { ...resizeParams, ...maxParams, ...minParams };
    props.onResize && props.onResize({ ..._params });
    return _params;
  }, [resizeParams, isMax, isMin]);

  // 关闭事件
  const onClose = (e) => {
    props.onClose && props.onClose(e);
  };

  // 最小化事件
  const onMin = (e) => {
    const reset = !isMin;
    _.has(props, 'isMin') ? null : setIsMin(reset);
    props.onMin && props.onMin(e, reset);
  };

  // 最大化事件
  const onMax = (e) => {
    const reset = !isMax;
    _.has(props, 'isMax') ? null : setIsMax(reset);
    props.onMax && props.onMax(e, reset);
  };

  return { ...params, modalRef, onClose, onMin, onMax, isMax, isMin };
};

const defaultProps = {
  threshold: 5,
  constraintSize: 200,
  defaultParams: { width: 500, height: 500, offsetX: 0, offsetY: 0 },
};

const Modal = (props) => {
  const state = useStateHook(props);
  return (
    <div
      ref={state.modalRef}
      style={{
        width: state.width,
        height: state.height,
        transform: `translate(${state.offsetX}px, ${state.offsetY}px)`,
        ...props.style,
      }}
      className={classNames(
        'qyrc-modal', 
        props.className, 
        { 'qyrc-modal-min': state.isMin, 'qyrc-modal-max': state.isMax }
      )}>
      <div className="qyrc-modal-body">
        <span
          className={classNames('qyrc-modal-tool', props.toolClassName)}
          style={{ top: props.threshold, left: props.threshold, ...props.toolStyle }}>
          <Icon
            type="icon-guanbi6-copy"
            onClick={state.onClose}
            className="qyrc-modal-tool-item qyrc-modal-tool-close"
          />
          <Icon
            type="icon-suoxiao"
            onClick={state.onMin}
            className="qyrc-modal-tool-item qyrc-modal-tool-min"
          />
          <Icon
            onClick={state.onMax}
            className="qyrc-modal-tool-item qyrc-modal-tool-max"
            type={state.isMax ? 'icon-suoxiao2' : 'icon-fangda1'}
          />
        </span>
        {props.children}
      </div>
    </div>
  );
};

Modal.defaultProps = defaultProps;

export default Modal;
