1. **Identify Performance Issue**: The `PaymentItem` component in two locations (`src/features/manager/finance/components/payments/PaymentItem/PaymentItem.jsx` and `src/features/manager/unitManagement/components/payments/PaymentItem.jsx`) extracts `loading` from the Redux store (`state.payments`) using `useSelector`.
2. **Determine the Impact**: Selecting `loading` from a list item component causes the component to re-render whenever the `loading` state changes, which could happen for other payments or unrelated operations. Since `loading` isn't even used in the component (only `isProcessing` is used to disable the button and show the spinner), it's completely unnecessary and causes wasted re-renders across all `PaymentItem` components in a list whenever `loading` changes in the Redux store.
3. **Execution**:
    - Remove `const { loading } = useSelector(state => state.payments);` from `src/features/manager/finance/components/payments/PaymentItem/PaymentItem.jsx`.
    - Remove `const { loading } = useSelector(state => state.payments);` from `src/features/manager/unitManagement/components/payments/PaymentItem.jsx`.
    - Also remove `useSelector` from imports if no longer needed (though it might still be imported for other reasons). Wait, it's not used for anything else. In both components, `useDispatch` and `useSelector` are imported together. I should remove `useSelector` import if it's unused. Let's check if `useSelector` is used elsewhere in the file.
4. **Validation**: Test the components to make sure they compile and work.
5. **Pre-commit**: Complete the required pre-commit instructions.
6. **Submit**: Create a PR with the required title and description.
